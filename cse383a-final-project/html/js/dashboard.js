let currentSearch = "";
let currentPage = 1;
let totalPages = 1;


$(document).ready(function () {
    $("#searchBtn").click(function () {
        let movieTitle = $("#movieInput").val().trim();

        if (movieTitle === "") {
            $("#statusMessage").text("Please enter a movie title.");
            return;
        }

        currentSearch = movieTitle;
        currentPage = 1;
        totalPages = 1;

        searchMovies(currentSearch, currentPage);
    });


    $("#movieInput").keypress(function (event) {
        if (event.which === 13) {
            $("#searchBtn").click();
        }
    });


    $("#previousPageBtn").click(function () {
        if (currentPage > 1) {
            currentPage--;
            searchMovies(currentSearch, currentPage);
        }
    });


    $("#nextPageBtn").click(function () {
        if (currentPage < totalPages) {
            currentPage++;
            searchMovies(currentSearch, currentPage);
        }
    });
});


function searchMovies(movieTitle, pageNumber) {
    $("#statusMessage").text("Searching...");
    $("#movieResults").empty();
    $("#resultsSection").addClass("d-none");
    $("#pageControls").addClass("d-none");

    $.ajax({
        url: "final.php/searchMovie",
        method: "GET",
        dataType: "text",
        data: {
            query: movieTitle,
            page: pageNumber
        }
    })
    .done(function (data) {
        try {
            let text = String(data).trim();

            if (text.charAt(0) === "1") {
                text = text.substring(1);
            }

            let response = JSON.parse(text);

            if (response.error) {
                $("#statusMessage").text(response.error);
                return;
            }

            let movies = response.results;

            if (!Array.isArray(movies) || movies.length === 0) {
                $("#statusMessage").text("No movie found.");
                return;
            }

            currentPage = Number(response.page);
            totalPages = Number(response.total_pages);

            movies.forEach(function (movie) {
                addMovieResult(movie);
            });

            $("#resultsSection").removeClass("d-none");
            $("#pageControls").removeClass("d-none");

            $("#pageNumber").text(
                "Page " + currentPage + " of " + totalPages
            );

            $("#previousPageBtn").prop("disabled", currentPage <= 1);
            $("#nextPageBtn").prop("disabled", currentPage >= totalPages);

            $("#statusMessage").text(
                response.total_results + " total results found."
            );
        }
        catch (error) {
            $("#statusMessage").text(
                "Parse error: " + error.message
            );
        }
    })
    .fail(function (xhr) {
        $("#statusMessage").text(
            "Request failed: " + xhr.status + " " + xhr.responseText
        );
    });
}


function addMovieResult(movie) {
    let title = movie.title || movie.original_title || "Untitled movie";

    let poster = movie.poster_path
        ? "https://image.tmdb.org/t/p/w500" + movie.poster_path
        : "";

    let overview = movie.overview || "No overview available.";
    let releaseDate = movie.release_date || "Unknown";

    let rating = movie.vote_average || movie.vote_average === 0
        ? movie.vote_average
        : "Not rated";

    let resultColumn = $("<div>", {
        class: "col-12"
    });

    let card = $("<article>", {
        class: "card p-4 movie-result"
    });

    let row = $("<div>", {
        class: "row g-4 align-items-start"
    });

    let posterColumn = $("<div>", {
        class: "col-md-3 text-center"
    });

    let detailsColumn = $("<div>", {
        class: "col-md-9"
    });


    if (poster) {
        posterColumn.append($("<img>", {
            class: "img-fluid rounded movie-result-poster",
            src: poster,
            alt: title + " poster"
        }));
    } else {
        posterColumn.append($("<div>", {
            class: "movie-poster-placeholder rounded",
            text: "No poster"
        }));
    }


    detailsColumn.append($("<h3>", {
        class: "h4",
        text: title
    }));


    detailsColumn.append(
        $("<p>").append(
            $("<strong>", {
                text: "Release Date: "
            }),
            document.createTextNode(releaseDate)
        )
    );


    detailsColumn.append(
        $("<p>").append(
            $("<strong>", {
                text: "Rating: "
            }),
            document.createTextNode(String(rating))
        )
    );


    detailsColumn.append($("<p>", {
        class: "mb-0",
        text: overview
    }));


    if (movie.id) {
        let trailerButton = $("<button>", {
            class: "btn btn-outline-primary mt-3",
            text: "Watch Trailer",
            type: "button"
        });

        let trailerArea = $("<div>", {
            class: "movie-trailer mt-3"
        });

        trailerButton.click(function () {
            loadTrailer(
                movie.id,
                title,
                trailerButton,
                trailerArea
            );
        });

        detailsColumn.append(trailerButton);
        detailsColumn.append(trailerArea);
    }


    row.append(posterColumn, detailsColumn);
    card.append(row);
    resultColumn.append(card);

    $("#movieResults").append(resultColumn);
}


function loadTrailer(movieId, title, trailerButton, trailerArea) {
    trailerButton.prop("disabled", true);
    trailerButton.text("Loading Trailer...");
    trailerArea.empty();

    $.ajax({
        url: "final.php/getMovieTrailer",
        method: "GET",
        dataType: "text",
        data: {
            movieid: movieId
        }
    })
    .done(function (data) {
        try {
            let text = String(data).trim();

            if (text.charAt(0) === "1") {
                text = text.substring(1);
            }

            let trailer = JSON.parse(text);

            if (trailer.error || !trailer.key) {
                trailerArea.append($("<p>", {
                    class: "text-muted mb-0",
                    text: trailer.error || "No trailer found."
                }));

                trailerButton.prop("disabled", false);
                trailerButton.text("Try Trailer Again");
                return;
            }

            let trailerFrame = $("<iframe>", {
                class: "movie-trailer-frame",
                src: "https://www.youtube.com/embed/" + encodeURIComponent(trailer.key),
                title: title + " trailer",
                allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                allowfullscreen: "allowfullscreen"
            });

            trailerArea.append(trailerFrame);
            trailerButton.addClass("d-none");
        }
        catch (error) {
            trailerArea.append($("<p>", {
                class: "text-danger mb-0",
                text: "Trailer could not be loaded."
            }));

            trailerButton.prop("disabled", false);
            trailerButton.text("Try Trailer Again");
        }
    })
    .fail(function () {
        trailerArea.append($("<p>", {
            class: "text-danger mb-0",
            text: "Trailer request failed."
        }));

        trailerButton.prop("disabled", false);
        trailerButton.text("Try Trailer Again");
    });
}
