let currentHistoryPage = 1;
let totalHistoryPages = 1;

let selectedHistoryId = null;
let selectedSearchTerm = "";
let currentSavedResultPage = 1;
let totalSavedResultPages = 1;


$(document).ready(function () {
    loadHistoryPage(currentHistoryPage);


    $("#previousHistoryPageBtn").click(function () {
        if (currentHistoryPage > 1) {
            currentHistoryPage--;
            loadHistoryPage(currentHistoryPage);
        }
    });


    $("#nextHistoryPageBtn").click(function () {
        if (currentHistoryPage < totalHistoryPages) {
            currentHistoryPage++;
            loadHistoryPage(currentHistoryPage);
        }
    });


    $("#previousSavedResultPageBtn").click(function () {
        if (currentSavedResultPage > 1) {
            currentSavedResultPage--;
            loadSavedResultPage(
                selectedHistoryId,
                selectedSearchTerm,
                currentSavedResultPage
            );
        }
    });


    $("#nextSavedResultPageBtn").click(function () {
        if (currentSavedResultPage < totalSavedResultPages) {
            currentSavedResultPage++;
            loadSavedResultPage(
                selectedHistoryId,
                selectedSearchTerm,
                currentSavedResultPage
            );
        }
    });
});


function cleanJson(data) {
    let text = String(data).trim();

    if (text.charAt(0) === "1") {
        text = text.substring(1);
    }

    return JSON.parse(text);
}


function loadHistoryPage(pageNumber) {
    $("#historyStatus").text("Loading search history...");
    $("#historyList").empty();
    $("#historyPageControls").addClass("d-none");

    /*
     * Clear the old selected search when changing history pages.
     * This stops an old/random-looking search from staying open below.
     */
    selectedHistoryId = null;
    selectedSearchTerm = "";
    currentSavedResultPage = 1;
    totalSavedResultPages = 1;

    $("#historyMovieResults").empty();
    $("#historyResultsSection").addClass("d-none");
    $("#savedResultPageControls").addClass("d-none");
    $("#savedResultsStatus").text("");

    $.ajax({
        url: "final.php/getHistory",
        method: "GET",
        dataType: "text",
        data: {
            page: pageNumber
        }
    })
    .done(function (data) {
        try {
            let response = cleanJson(data);

            if (
                !response.results ||
                !Array.isArray(response.results) ||
                response.results.length === 0
            ) {
                $("#historyStatus").text("No search history found.");
                return;
            }

            currentHistoryPage = Number(response.page);
            totalHistoryPages = Number(response.total_pages);

            response.results.forEach(function (search) {
                addHistoryRow(search);
            });

            $("#historyPageControls").removeClass("d-none");

            $("#historyPageNumber").text(
                "History Page " +
                currentHistoryPage +
                " of " +
                totalHistoryPages
            );

            $("#previousHistoryPageBtn").prop(
                "disabled",
                currentHistoryPage <= 1
            );

            $("#nextHistoryPageBtn").prop(
                "disabled",
                currentHistoryPage >= totalHistoryPages
            );

            $("#historyStatus").text(
                response.total_results +
                " saved searches total."
            );
        }
        catch (error) {
            $("#historyStatus").text(
                "History parse error: " + error.message
            );
        }
    })
    .fail(function (xhr) {
        $("#historyStatus").text(
            "History request failed: " +
            xhr.status +
            " " +
            xhr.responseText
        );
    });
}

function addHistoryRow(search) {
    let label =
        (search.search_term || "Unknown search") +
        " (" +
        (search.timestamp || "Unknown time") +
        ")";

    let historyButton = $("<button>", {
        class: "list-group-item list-group-item-action",
        type: "button",
        text: label
    });

    historyButton.click(function () {
        $("#historyList .active").removeClass("active");
        historyButton.addClass("active");

        selectedHistoryId = search.id;
        selectedSearchTerm = search.search_term || "Saved Search";
        currentSavedResultPage = 1;

        loadSavedResultPage(
            selectedHistoryId,
            selectedSearchTerm,
            currentSavedResultPage
        );
    });

    $("#historyList").append(historyButton);
}


function loadSavedResultPage(searchId, searchTerm, pageNumber) {
    $("#historyMovieResults").empty();
    $("#historyResultsSection").addClass("d-none");
    $("#savedResultPageControls").addClass("d-none");
    $("#savedResultsStatus").text("Loading saved search results...");

    $.ajax({
        url: "final.php/getSavedSearchResults",
        method: "GET",
        dataType: "text",
        data: {
            id: searchId,
            page: pageNumber
        }
    })
    .done(function (data) {
        try {
            let response = cleanJson(data);

            if (response.error) {
                $("#savedResultsStatus").text(response.error);
                $("#historyResultsSection").removeClass("d-none");
                return;
            }

            if (
                !response.results ||
                !Array.isArray(response.results) ||
                response.results.length === 0
            ) {
                $("#savedResultsStatus").text("No movie results found.");
                $("#historyResultsSection").removeClass("d-none");
                return;
            }

            currentSavedResultPage = Number(response.page);
            totalSavedResultPages = Number(response.total_pages);

            response.results.forEach(function (movie) {
                addHistoryMovie(movie);
            });

            $("#historyResultsTitle").text(
                "Results for: " + searchTerm
            );

            $("#historyResultsSection").removeClass("d-none");
            $("#savedResultPageControls").removeClass("d-none");

            $("#savedResultPageNumber").text(
                "Results Page " +
                currentSavedResultPage +
                " of " +
                totalSavedResultPages
            );

            $("#previousSavedResultPageBtn").prop(
                "disabled",
                currentSavedResultPage <= 1
            );

            $("#nextSavedResultPageBtn").prop(
                "disabled",
                currentSavedResultPage >= totalSavedResultPages
            );

            $("#savedResultsStatus").text(
                response.total_results +
                " movie results for this search."
            );
        }
        catch (error) {
            $("#savedResultsStatus").text(
                "Saved results parse error: " + error.message
            );

            $("#historyResultsSection").removeClass("d-none");
        }
    })
    .fail(function (xhr) {
        $("#savedResultsStatus").text(
            "Saved results request failed: " +
            xhr.status +
            " " +
            xhr.responseText
        );

        $("#historyResultsSection").removeClass("d-none");
    });
}


function addHistoryMovie(movie) {
    let title =
        movie.title ||
        movie.original_title ||
        "Untitled movie";

    let poster = movie.poster_path
        ? "https://image.tmdb.org/t/p/w500" + movie.poster_path
        : "";

    let releaseDate = movie.release_date || "Unknown";

    let rating = movie.vote_average || movie.vote_average === 0
        ? movie.vote_average
        : "Not rated";

    let overview = movie.overview || "No overview available.";

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
            type: "button",
            text: "Watch Trailer"
        });

        let trailerArea = $("<div>", {
            class: "movie-trailer mt-3"
        });

        trailerButton.click(function () {
            loadHistoryTrailer(
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

    $("#historyMovieResults").append(resultColumn);
}


function loadHistoryTrailer(movieId, title, trailerButton, trailerArea) {
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
            let trailer = cleanJson(data);

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
                src: "https://www.youtube.com/embed/" +
                    encodeURIComponent(trailer.key),
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
