$(document).ready(function () {
    function cleanJson(data) {
        let text = String(data).trim();

        let arrayStart = text.indexOf("[");
        let objectStart = text.indexOf("{");
        let jsonStart = -1;

        if (arrayStart > -1 && objectStart > -1) {
            jsonStart = Math.min(arrayStart, objectStart);
        } else if (arrayStart > -1) {
            jsonStart = arrayStart;
        } else {
            jsonStart = objectStart;
        }

        if (jsonStart > -1) {
            text = text.substring(jsonStart);
        }

        return JSON.parse(text);
    }

    $.ajax({
        url: "final.php/getHistory",
        method: "GET",
        dataType: "text"
    })
    .done(function (data) {
        let history = cleanJson(data);

        $("#historyList").empty();

        history.forEach(function (item) {
            $("#historyList").append(`
                <button class="list-group-item list-group-item-action" data-id="${item.id}">
                    ${item.search_term} (${item.timestamp})
                </button>
            `);
        });
    })
    .fail(function () {
        $("#historyList").html('<p class="text-danger">Failed to load history.</p>');
    });

    $(document).on("click", ".list-group-item", function () {
        let id = $(this).data("id");

        $.ajax({
            url: "final.php/getSearchById",
            method: "GET",
            dataType: "text",
            data: { id: id }
        })
        .done(function (data) {
            let movie = cleanJson(data);

            $("#historyTitle").text(movie.title || movie.original_title || "");
            $("#historyRelease").text(movie.release_date || "");
            $("#historyRating").text(movie.vote_average || "");
            $("#historyOverview").text(movie.overview || "");

            if (movie.poster_path) {
                $("#historyPoster").attr("src", "https://image.tmdb.org/t/p/w500" + movie.poster_path);
            }

            $("#historyResult").removeClass("d-none");
        })
        .fail(function () {
            $("#historyOverview").text("Failed to load movie.");
            $("#historyResult").removeClass("d-none");
        });
    });
});
