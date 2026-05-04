$(document).ready(function() {

    // Load history on page load
    $.ajax({
        url: "RestServer.php",
        method: "GET",
        data: { action: "getHistory" }
    })
    .done(function(data) {
        let history = JSON.parse(data);

        history.forEach(item => {
            $("#historyList").append(`
                <button class="list-group-item list-group-item-action" data-id="${item.id}">
                    ${item.search_term} (${item.timestamp})
                </button>
            `);
        });
    })
    .fail(function() {
        alert("Failed to load history");
    });


    // Click event to reload movie
    $(document).on("click", ".list-group-item", function() {

        let id = $(this).data("id");

        $.ajax({
            url: "RestServer.php",
            method: "GET",
            data: { action: "getSearchById", id: id }
        })
        .done(function(data) {

            let movie = JSON.parse(data);

            $("#historyTitle").text(movie.title);
            $("#historyRelease").text(movie.release_date);
            $("#historyRating").text(movie.vote_average);
            $("#historyOverview").text(movie.overview);

            $("#historyPoster").attr("src",
                "https://image.tmdb.org/t/p/w500" + movie.poster_path
            );

            $("#historyResult").removeClass("d-none");
        })
        .fail(function() {
            alert("Failed to load movie");
        });

    });

});
