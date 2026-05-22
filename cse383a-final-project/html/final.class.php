<?php

class final_rest
{
    public static function getLevel()
    {
        return json_encode($retData);
    }


    public static function addLog($search, $result_json)
    {
        try {
            EXEC_SQL(
                "insert into log (search, result_json) values (?, ?)",
                $search,
                $result_json
            );

            $retData["status"] = 0;
            $retData["message"] = "";
        }
        catch (Exception $e) {
            $retData["status"] = 1;
            $retData["message"] = "Unable to add log record: " . $e->getMessage();
        }

        return $retData;
    }


    public static function getLog()
    {
        try {
            $retData["status"] = 0;
            $retData["message"] = "";
            $retData["result"] = GET_SQL(
                "select * from log order by timestamp desc"
            );
        }
        catch (Exception $e) {
            $retData["status"] = 1;
            $retData["message"] = "Unable to retrieve log records: " . $e->getMessage();
        }

        return $retData;
    }


    public static function deleteLog($id)
    {
        try {
            EXEC_SQL(
                "delete from log where id = ?",
                $id
            );

            $retData["status"] = 0;
            $retData["message"] = "Log deleted";
        }
        catch (Exception $e) {
            $retData["status"] = 1;
            $retData["message"] = "Unable to delete log: " . $e->getMessage();
        }

        return $retData;
    }


    public static function clearLog()
    {
        try {
            EXEC_SQL("delete from log");

            $retData["status"] = 0;
            $retData["message"] = "All logs cleared";
        }
        catch (Exception $e) {
            $retData["status"] = 1;
            $retData["message"] = "Unable to clear logs: " . $e->getMessage();
        }

        return $retData;
    }


    private static function requestMovieSearch($query, $page)
    {
        $tmdbToken = getenv("TMDB_TOKEN");

        if (!$tmdbToken) {
            return ["error" => "TMDB token is missing"];
        }

        if (!is_numeric($page) || $page < 1) {
            $page = 1;
        }

        $requestUrl =
            "https://api.themoviedb.org/3/search/movie?query="
            . urlencode($query)
            . "&page="
            . urlencode($page);

        $ch = curl_init($requestUrl);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $tmdbToken,
            "accept: application/json"
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);

        if (!$data || empty($data["results"])) {
            return ["error" => "No movie found"];
        }

        return [
            "page" => $data["page"],
            "total_pages" => $data["total_pages"],
            "total_results" => $data["total_results"],
            "results" => $data["results"]
        ];
    }


    public static function searchMovie($query, $page)
    {
        $searchResults = self::requestMovieSearch($query, $page);

        if (isset($searchResults["error"])) {
            return $searchResults;
        }

        $db = new PDO("sqlite:cse383.db");

        $stmt = $db->prepare(
            "INSERT INTO searches (search_term, request_json, response_json)
             VALUES (?, ?, ?)"
        );

        $stmt->execute([
            $query,
            json_encode([
                "query" => $query,
                "page" => $page
            ]),
            json_encode($searchResults["results"])
        ]);

        return $searchResults;
    }


    public static function getMovieTrailer($movieid)
    {
        $tmdbToken = getenv("TMDB_TOKEN");

        if (!$tmdbToken) {
            return ["error" => "TMDB token is missing"];
        }

        if (!is_numeric($movieid)) {
            return ["error" => "Invalid movie id"];
        }

        $requestUrl =
            "https://api.themoviedb.org/3/movie/"
            . urlencode($movieid)
            . "/videos";

        $ch = curl_init($requestUrl);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $tmdbToken,
            "accept: application/json"
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);

        if (!$data || empty($data["results"])) {
            return ["error" => "No trailer found"];
        }

        $youtubeTrailers = array_values(
            array_filter($data["results"], function ($video) {
                return isset(
                    $video["site"],
                    $video["type"],
                    $video["key"]
                )
                && $video["site"] === "YouTube"
                && $video["type"] === "Trailer";
            })
        );

        if (empty($youtubeTrailers)) {
            return ["error" => "No trailer found"];
        }

        foreach ($youtubeTrailers as $trailer) {
            if (!empty($trailer["official"])) {
                return $trailer;
            }
        }

        return $youtubeTrailers[0];
    }


    public static function getHistory($page)
    {
        if (!is_numeric($page) || $page < 1) {
            $page = 1;
        }

        $page = (int) $page;
        $perPage = 20;
        $offset = ($page - 1) * $perPage;

        $db = new PDO("sqlite:cse383.db");

        $countStmt = $db->query(
            "SELECT COUNT(*) AS total FROM searches"
        );

        $countRow = $countStmt->fetch(PDO::FETCH_ASSOC);
        $totalResults = (int) $countRow["total"];
        $totalPages = max(1, ceil($totalResults / $perPage));

        if ($page > $totalPages) {
            $page = $totalPages;
            $offset = ($page - 1) * $perPage;
        }

        $stmt = $db->prepare(
            "SELECT id, search_term, timestamp
             FROM searches
             ORDER BY timestamp DESC
             LIMIT :limit OFFSET :offset"
        );

        $stmt->bindValue(":limit", $perPage, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        $historyRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            "page" => $page,
            "total_pages" => $totalPages,
            "total_results" => $totalResults,
            "results" => $historyRows
        ];
    }


    public static function getSavedSearchResults($id, $page)
    {
        if (!is_numeric($id)) {
            return ["error" => "Invalid search id"];
        }

        if (!is_numeric($page) || $page < 1) {
            $page = 1;
        }

        $db = new PDO("sqlite:cse383.db");

        $stmt = $db->prepare(
            "SELECT search_term
             FROM searches
             WHERE id = ?"
        );

        $stmt->execute([$id]);
        $search = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$search) {
            return ["error" => "Saved search not found"];
        }

        $searchResults = self::requestMovieSearch(
            $search["search_term"],
            $page
        );

        if (isset($searchResults["error"])) {
            return $searchResults;
        }

        $searchResults["search_term"] = $search["search_term"];

        return $searchResults;
    }


    public static function getSearchById($id)
    {
        $rows = GET_SQL(
            "SELECT response_json
             FROM searches
             WHERE id = ?",
            $id
        );

        if (count($rows) < 1) {
            return ["error" => "Search not found"];
        }

        return json_decode($rows[0]["response_json"], true);
    }
}
