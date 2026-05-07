$(document).ready(function () {
    $("#searchBtn").click(function () {
        let movieTitle = $("#movieInput").val().trim();

        if (movieTitle === "") {
            $("#statusMessage").text("Please enter a movie title.");
            return;
        }

        $("#statusMessage").text("Searching...");
        $("#resultsSection").addClass("d-none");

        $.ajax({
            url: "final.php/searchMovie",
            method: "GET",
            dataType: "text",
            data: { query: movieTitle }
        })
        .done(function (data) {
            try {
                let text = String(data).trim();

                if (text.charAt(0) === "1") {
                    text = text.substring(1);
                }

                let movie = JSON.parse(text);

                if (movie.error) {
                    $("#statusMessage").text(movie.error);
                    return;
                }

                $("#movieTitle").text(movie.title || movie.original_title || "");
                $("#movieRelease").text(movie.release_date || "");
                $("#movieRating").text(movie.vote_average || "");
                $("#movieOverview").text(movie.overview || "");

                if (movie.poster_path) {
                    $("#moviePoster").attr("src", "https://image.tmdb.org/t/p/w500" + movie.poster_path);
                }

                $("#resultsSection").removeClass("d-none");
                $("#statusMessage").text("Movie loaded successfully.");
            } catch (e) {
                $("#statusMessage").text("Parse error: " + e.message + " | " + String(data).slice(0, 100));
            }
        })
        .fail(function (xhr) {
            $("#statusMessage").text("Request failed: " + xhr.status + " " + xhr.responseText);
        });
    });
});
