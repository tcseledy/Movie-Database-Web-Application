$(document).ready(function () {

    $("#searchBtn").click(function () {

        let movieTitle = $("#movieInput").val();

        if (movieTitle.trim() === "") {
            $("#statusMessage").text("Please enter a movie title.");
            return;
        }

        $("#statusMessage").text("Searching...");

        $.ajax({
            url: "RestServer.php",
            method: "GET",
            data: {
                action: "searchMovie",
                query: movieTitle
            }
        })
        .done(function (data) {

            let movie = JSON.parse(data);

            $("#movieTitle").text(movie.title);
            $("#movieRelease").text(movie.release_date);
            $("#movieRating").text(movie.vote_average);
            $("#movieOverview").text(movie.overview);

            if (movie.poster_path) {
                $("#moviePoster").attr(
                    "src",
                    "https://image.tmdb.org/t/p/w500" + movie.poster_path
                );
            }

            $("#resultsSection").removeClass("d-none");
            $("#statusMessage").text("Movie loaded successfully.");
        })
        .fail(function () {
            $("#statusMessage").text("Search failed. Check your API or PHP.");
        });

    });

});
