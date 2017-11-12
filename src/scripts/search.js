function filterSideBar(hideCheckFunction) {

    //hide all issues the don't match
    $('.th-navigation').children('.mdl-navigation__link').each(function () {
        if (hideCheckFunction($(this))) {
            $(this).data("hidden", "true");
            this.setAttribute("style", "display: none !important");
        } else {
            $(this).data("hidden", "false");
            this.setAttribute("style", "display: block");
        }
    });

    //hide all repos that have no issues matching
    $('.th-navigation').children('.mdl-list__item').each(function () {
        let hide = true;
        $('.' + this.id).each(function () {
            if ($(this).data('hidden') === "false") {
                hide = false;
                return;
            }
        });

        if (hide) {
            this.setAttribute("style", "display: none !important");
        } else {
            this.setAttribute("style", "display: block");
        }
    });
}

function matchText(element) {
    let searchText = $('#search').val().toLowerCase();
    return element.contents().filter(function (a) {
        return a === 1;
    }).text().toLowerCase().indexOf(searchText) === -1
}