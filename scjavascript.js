/* =========================================================
   <!--Search Option Coding | Explore by Category or Location--><!--Search Option Coding | Explore by Category or Location-->
   <!--Search Option Coding | Explore by Category or Location--><!--Search Option Coding | Explore by Category or Location-->
   ========================================================= */
(function(){
"use strict";
const ASHUB_URL =
    "https://www.theashub.in";
const ASPIRANTS_LABEL =
    "AspirantsNotifications";
const DAYS_LIMIT =
    35;
const FEED_BATCH_SIZE =
    25;
const CATEGORIES = [
    ["Agriculture Jobs","Agriculture Jobs"],
    ["Apprenticeship","Apprenticeship"],
    ["Banking Jobs","Banking Jobs"],
    ["Civil Services Jobs","Civil Services Jobs"],
    ["Competition Opportunities","Competition"],
    ["Content Writer Jobs","Content Writer Jobs"],
    ["Defence and Police Jobs","Defence and Police Jobs"],
  	["DSSSB Jobs","DSSSB"],
    ["Fellowship Programs","Fellowship"],
    ["Freelancing Opportunities","Freelancing"],
	["Government Jobs","Government Jobs"],
    ["Hackathon","Hackathon"],
    ["Healthcare Jobs","Healthcare Jobs"],
    ["International Jobs","International Jobs"],
    ["Internship Opportunities","Internship"],
    ["Journalism Jobs","Journalism Jobs"],
    ["Post Office Jobs","Post Office Jobs"],
    ["PSU Jobs","PSU Jobs"],
    ["Railway Jobs","Railway Jobs"],
    ["Sports Quota Jobs","Sports Quota Jobs"],
    ["SSC Jobs","SSC"],
    ["Teaching Jobs","Teaching Jobs"],
    ["Telecom Jobs","Telecom Jobs"],
    ["Video Contest","Video Contest"],
    ["Work From Home","Work From Home"],
    ["8th Pass Jobs","8th Pass Jobs"]
];
/* LOCATIONS */
const LOCATIONS = [
    ["Delhi","Delhi"],
    ["Mumbai","Mumbai"],
    ["Kolkata","Kolkata"],
    ["Chennai","Chennai"],
    ["Hyderabad","Hyderabad"],
    ["Lucknow","Lucknow"],
    ["Prayagraj","Prayagraj"],
    ["Gorakhpur","Gorakhpur"],
    ["Noida","Noida"],
    ["Uttar Pradesh","Uttar Pradesh"],
    ["Pan India","Pan India"],
    ["Remote","Remote"]
];
const popup =
    document.getElementById(
        "ashubSearchPopup"
    );
const dialog =
    document.getElementById(
        "ashubPopupDialog"
    );
const openButton =
    document.getElementById(
        "ashubOpenSearch"
    );
const closeButton =
    document.getElementById(
        "ashubPopupClose"
    );
const searchButton =
    document.getElementById(
        "ashubSearchButton"
    );
const loadingBox =
    document.getElementById(
        "ashubSearchLoading"
    );
const categorySelect =
    document.getElementById(
        "ashubCategory"
    );
const locationSelect =
    document.getElementById(
        "ashubLocation"
    );
const results =
    document.getElementById(
        "ashubResults"
    );
/* STATE */
let allPosts = [];
let filteredPosts = [];
let postsLoaded = false;
let searching = false;
let dropdownsReady = false;
let lastFocusedElement = null;
/* HELPERS */
function normalize(value){
    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g," ")
        .trim();
}
function cleanText(value){
    return String(value || "")
        .replace(/\u00a0/g," ")
        .replace(/\s+/g," ")
        .trim();
}
function safeURL(url){
    if(!url){
        return "";
    }
    try{
        const parsed =
            new URL(
                url,
                ASHUB_URL
            );
        if(
            parsed.protocol !== "http:" &&
            parsed.protocol !== "https:"
        ){
            return "";
        }
        return parsed.href;
    }
    catch(error){
        return "";
    }
}
function formatDate(date){
    if(!date){
        return "";
    }
    const parsed =
        new Date(date);
    if(
        Number.isNaN(
            parsed.getTime()
        )
    ){
        return "";
    }
    return parsed.toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );
}
/* 35-DAY FILTER */
function getCutoffDate(){
    const now =
        new Date();
    return new Date(
        now.getTime() -
        DAYS_LIMIT *
        24 *
        60 *
        60 *
        1000
    );
}
function isRecentPost(date){
    if(!date){
        return false;
    }
    const published =
        new Date(date);
    if(
        Number.isNaN(
            published.getTime()
        )
    ){
        return false;
    }
    return (
        published >=
        getCutoffDate()
    );
}
/*OPEN POPUP*/
function openSearchPopup(){
    if(!popup){
        return;
    }
    lastFocusedElement =
        document.activeElement;
    popup.classList.add(
        "is-open"
    );
    popup.setAttribute(
        "aria-hidden",
        "false"
    );
    document.body.classList.add(
        "ashub-popup-open"
    );
    populateDropdowns();
    /*
     * Clear old visible results.
     *
     * The feed itself remains cached.
     */
    results.innerHTML =
        "";
    requestAnimationFrame(
        function(){
            categorySelect?.focus();
        }
    );
}
/* CLOSE POPUP */
function closeSearchPopup(){
    if(!popup){
        return;
    }
    popup.classList.remove(
        "is-open"
    );
    popup.setAttribute(
        "aria-hidden",
        "true"
    );
    document.body.classList.remove(
        "ashub-popup-open"
    );
    setSearchLoading(
        false
    );
    if(
        lastFocusedElement &&
        typeof lastFocusedElement.focus ===
        "function"
    ){
        lastFocusedElement.focus();
    }
}
/* DROPDOWNS */
function populateDropdowns(){
    if(
        dropdownsReady ||
        !categorySelect ||
        !locationSelect
    ){
        return;
    }
    CATEGORIES.forEach(
        function(item){
            const option =
                document.createElement(
                    "option"
                );
            option.value =
                item[1];
            option.textContent =
                item[0];
            categorySelect.appendChild(
                option
            );
        }
    );
    LOCATIONS.forEach(
        function(item){

            const option =
                document.createElement(
                    "option"
                );
            option.value =
                item[1];
            option.textContent =
                item[0];
            locationSelect.appendChild(
                option
            );

        }
    );
    dropdownsReady =
        true;
}
function setSearchLoading(show){
    if(
        !dialog ||
        !loadingBox
    ){

        return;
    }
    if(show){
        dialog.classList.add(
            "is-searching"
        );
        loadingBox.classList.add(
            "is-visible"
        );
        loadingBox.setAttribute(
            "aria-hidden",
            "false"
        );
        searchButton.disabled =
            true;
    }
    else{
        dialog.classList.remove(
            "is-searching"
        );
        loadingBox.classList.remove(
            "is-visible"
        );
        loadingBox.setAttribute(
            "aria-hidden",
            "true"
        );
        searchButton.disabled =
            false;
    }
}
/* BLOGGER FEED */
async function getPosts(){
    const recentPosts =
        [];
    let startIndex =
        1;
    let shouldContinue =
        true;
    while(shouldContinue){
        const feedURL =
            ASHUB_URL +
            "/feeds/posts/default/-/" +
            encodeURIComponent(
                ASPIRANTS_LABEL
            ) +
            "?alt=json" +
            "&start-index=" +
            startIndex +
            "&max-results=" +
            FEED_BATCH_SIZE;
        try{
            const response =
                await fetch(
                    feedURL,
                    {
                        method:"GET",
                        credentials:"omit",
                        cache:"default"
                    }
                );
            if(!response.ok){
                throw new Error(
                    "Feed request failed: " +
                    response.status
                );
            }
            const data =
                await response.json();
            const entries =
                data.feed?.entry ||
                [];
            /*
             * No more posts.
             */
            if(
                !entries.length
            ){
                break;
            }
            /*
             * Process newest first.
             */
            for(
                let i = 0;
                i < entries.length;
                i++
            ){

                const entry =
                    entries[i];


                const published =
                    entry.published?.$t ||
                    entry.updated?.$t ||
                    "";
                if(
                    published &&
                    !isRecentPost(
                        published
                    )
                ){

                    shouldContinue =
                        false;

                    break;

                }
                const post =
                    parsePost(
                        entry
                    );
                if(post.url){
                    recentPosts.push(
                        post
                    );
                }
            }
            if(
                entries.length <
                FEED_BATCH_SIZE
            ){
                break;
            }
            startIndex +=
                FEED_BATCH_SIZE;
        }
        catch(error){

            console.error(
                "theAShub feed error:",
                error
            );
            break;
        }
    }
    return recentPosts
        .filter(
            function(post){
                return isRecentPost(
                    post.date
                );
            }
        )
        .sort(
            function(a,b){
                return (
                    new Date(b.date) -
                    new Date(a.date)
                );
            }
        );
}
function parsePost(entry){
    let url = "";
    const alternate =
        entry.link?.find(
            function(link){

                return (
                    link.rel ===
                    "alternate"
                );

            }
        );
    if(alternate){
        url =
            safeURL(
                alternate.href
            );
    }
    const title =
        entry.title?.$t ||
        "Untitled";
    const date =
        entry.published?.$t ||
        entry.updated?.$t ||
        "";
    const html =
        entry.content?.$t ||
        entry.summary?.$t ||
        "";
    const labels =
        entry.category?.map(
            function(category){
                return normalize(
                    category.term
                );
            }
        ) || [];
    let image =
        "";
    const imageMatch =
        html.match(
            /<img[^>]+(?:src|data-src)=["']([^"']+)["']/i
        );
    if(imageMatch){
        image =
            imageMatch[1];
    }
    if(
        !image &&
        entry.media$thumbnail?.url
    ){
        image =
            entry.media$thumbnail.url;
    }
    if(image){
        image =
            image
                .replace(
                    /\/s\d+(-c)?\//i,
                    "/s600/"
                )
                .replace(
                    /\/w\d+-h\d+(-c)?\//i,
                    "/s600/"
                )
                .replace(
                    /\/s72-c\//i,
                    "/s600/"
                );
    }
    const quick =
        getQuickInfo(
            html
        );
    return {
        title:
            cleanText(
                title
            ),
        url:
            url,
        date:
            date,
        labels:
            labels,

        image:
            image,

        quick:
            quick,

        searchableText:
            normalize(
                title +
                " " +
                labels.join(" ") +
                " " +
                Object.values(
                    quick
                ).join(" ")
            )

    };
}
function getQuickInfo(html){
    const data = {
        location:"",
        eligibility:"",
        benefit:"",
        whatToDo:"",
        deadline:"",
        salary:"",
        posts:"",
        course:"",
        selectionProcess:""
    };
    if(!html){

        return data;

    }


    const doc =
        new DOMParser()
            .parseFromString(
                html,
                "text/html"
            );


    const container =
        doc.querySelector(
            ".theashub-highlights-quick"
        );


    if(!container){

        return data;

    }


    function findValue(label){

        const wanted =
            normalize(
                label
            );


        const elements =
            container.querySelectorAll(
                "div,p,li,td,tr,dt,dd,span,strong,b"
            );


        for(
            let i = 0;
            i < elements.length;
            i++
        ){

            const element =
                elements[i];


            const value =
                cleanText(
                    element.innerText ||
                    element.textContent
                );


            if(!value){

                continue;

            }


            const normalizedValue =
                normalize(
                    value
                );


            /*
             * Supports:
             *
             * Location: Delhi
             * Location - Delhi
             */

            const prefix =
                new RegExp(
                    "^" +
                    label.replace(
                        /[-\/\\^$*+?.()|[\]{}]/g,
                        "\\$&"
                    ) +
                    "\\s*[:\\-]\\s*(.+)$",
                    "i"
                );


            const match =
                value.match(
                    prefix
                );


            if(match){

                return cleanText(
                    match[1]
                );

            }


            /*
             * Supports:
             *
             * <strong>Location</strong>
             * <span>Delhi</span>
             */

            if(
                normalizedValue ===
                wanted
            ){

                const next =
                    element.nextElementSibling;


                if(next){

                    const nextValue =
                        cleanText(
                            next.innerText ||
                            next.textContent
                        );


                    if(
                        nextValue &&
                        normalize(
                            nextValue
                        ) !== wanted
                    ){

                        return nextValue;

                    }

                }

            }

        }


        return "";

    }


    data.location =
        findValue(
            "Location"
        );


    data.eligibility =
        findValue(
            "Eligibility"
        );


    data.benefit =
        findValue(
            "Benefit"
        );


    data.whatToDo =
        findValue(
            "What To Do"
        ) ||
        findValue(
            "How To Apply"
        );


    data.deadline =
        findValue(
            "Deadline"
        );


    data.salary =
        findValue(
            "Salary"
        );


    data.posts =
        findValue(
            "Post"
        );


    data.course =
        findValue(
            "Course"
        );


    data.selectionProcess =
        findValue(
            "Selection Process"
        );


    return data;

}


/* =========================================================
   FILTER POSTS
========================================================= */

function filterPosts(
    category,
    location
){

    const normalizedCategory =
        normalize(
            category
        );


    const normalizedLocation =
        normalize(
            location
        );


    return allPosts.filter(
        function(post){

            /*
             * Final 35-day safety check.
             */

            if(
                !isRecentPost(
                    post.date
                )
            ){

                return false;

            }


            /*
             * CATEGORY
             */

            const categoryMatch =
                !normalizedCategory ||
                post.labels.includes(
                    normalizedCategory
                );


            /*
             * LOCATION
             */

            const locationMatch =
                !normalizedLocation ||

                post.labels.includes(
                    normalizedLocation
                ) ||

                normalize(
                    post.quick.location
                ).includes(
                    normalizedLocation
                ) ||

                post.searchableText.includes(
                    normalizedLocation
                );


            return (
                categoryMatch &&
                locationMatch
            );

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

async function searchPosts(){

    if(searching){

        return;

    }


    searching =
        true;


    setSearchLoading(
        true
    );


    results.innerHTML =
        "";


    const category =
        categorySelect?.value ||
        "";


    const location =
        locationSelect?.value ||
        "";


    /*
     * Give browser one frame
     * to display the loading state.
     */

    await new Promise(
        function(resolve){

            requestAnimationFrame(
                resolve
            );

        }
    );


    /*
     * Fetch feed only once
     * during this page session.
     */

    if(!postsLoaded){

        allPosts =
            await getPosts();

        postsLoaded =
            true;

    }


    /*
     * Apply filters.
     */

    filteredPosts =
        filterPosts(
            category,
            location
        );


    /*
     * No results.
     */

    if(
        !filteredPosts.length
    ){

        showNoResults();

        setSearchLoading(
            false
        );

        searching =
            false;

        return;

    }


    /*
     * Render results.
     */

    renderResults();


    requestAnimationFrame(
        function(){

            setSearchLoading(
                false
            );

        }
    );


    searching =
        false;

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults(){

    const fragment =
        document.createDocumentFragment();


    filteredPosts.forEach(
        function(post){

            fragment.appendChild(
                createPostElement(
                    post
                )
            );

        }
    );


    results.appendChild(
        fragment
    );

}


/* =========================================================
   CREATE POST CARD
========================================================= */

function createPostElement(post){

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "ashub-post";


    article.setAttribute(
        "role",
        "link"
    );


    article.setAttribute(
        "tabindex",
        "0"
    );


    article.dataset.url =
        safeURL(
            post.url
        );


    /*
     * IMAGE
     */

    const imageWrap =
        document.createElement(
            "div"
        );


    imageWrap.className =
        "ashub-post-image-wrap";


    if(post.image){

        const image =
            document.createElement(
                "img"
            );


        image.className =
            "ashub-post-image";


        image.src =
            post.image;


        image.alt =
            post.title;


        /*
         * Lazy loading keeps
         * initial popup fast.
         */

        image.loading =
            "lazy";


        image.decoding =
            "async";


        image.addEventListener(
            "error",
            function(){

                imageWrap.innerHTML =
                    '<div class="ashub-no-image">No Image</div>';

            },
            {
                once:true
            }
        );


        imageWrap.appendChild(
            image
        );

    }

    else{

        imageWrap.innerHTML =
            '<div class="ashub-no-image">No Image</div>';

    }


    /*
     * CONTENT
     */

    const content =
        document.createElement(
            "div"
        );


    content.className =
        "ashub-post-content";


    /*
     * TITLE
     */

    const title =
        document.createElement(
            "h3"
        );


    title.className =
        "ashub-post-title";


    title.textContent =
        post.title;


    content.appendChild(
        title
    );


    /*
     * DATE
     */

    const date =
        document.createElement(
            "div"
        );


    date.className =
        "ashub-post-date";


    date.textContent =
        formatDate(
            post.date
        );


    if(date.textContent){

        content.appendChild(
            date
        );

    }


    /*
     * QUICK INFORMATION
     */

    const quickInfo =
        buildQuickInfo(
            post.quick
        );


    if(quickInfo){

        content.appendChild(
            quickInfo
        );

    }


    article.appendChild(
        imageWrap
    );


    article.appendChild(
        content
    );


    return article;

}


/* =========================================================
   QUICK INFO
========================================================= */

function buildQuickInfo(quick){

    const fields = [

        ["Location",quick.location],

        ["Eligibility",quick.eligibility],

        ["Benefit",quick.benefit],

        ["What To Do",quick.whatToDo],

        ["Deadline",quick.deadline],

        ["Salary",quick.salary],

        ["Post",quick.posts],

        ["Course",quick.course],

        ["Selection Process",quick.selectionProcess]

    ];


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "ashub-quick-info";


    let hasValue =
        false;


    fields.forEach(
        function(field){

            if(!field[1]){

                return;

            }


            hasValue =
                true;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "ashub-quick-item";


            const strong =
                document.createElement(
                    "strong"
                );


            strong.textContent =
                field[0] +
                ":";


            item.appendChild(
                strong
            );


            item.appendChild(
                document.createTextNode(
                    " " +
                    field[1]
                )
            );


            wrapper.appendChild(
                item
            );

        }
    );


    return hasValue
        ? wrapper
        : null;

}


/* =========================================================
   NO RESULTS
========================================================= */

function showNoResults(){

    results.innerHTML =
        "";


    const box =
        document.createElement(
            "div"
        );


    box.className =
        "ashub-no-results";


    const title =
        document.createElement(
            "h3"
        );


    title.className =
        "ashub-no-results-title";


    title.textContent =
        "No Careers and Opportunities Found";


    const text =
        document.createElement(
            "p"
        );


    text.className =
        "ashub-no-results-text";


    text.textContent =
        "Try another category or location !";


    box.appendChild(
        title
    );


    box.appendChild(
        text
    );


    results.appendChild(
        box
    );

}


/* =========================================================
   OPEN RESULT IN NEW TAB
========================================================= */

function openPost(url){

    const safe =
        safeURL(
            url
        );


    if(!safe){

        return;

    }


    const newWindow =
        window.open(
            safe,
            "_blank",
            "noopener,noreferrer"
        );


    if(newWindow){

        try{

            newWindow.opener =
                null;

        }

        catch(error){}

    }

}


/* =========================================================
   RESULT CLICK
========================================================= */

results?.addEventListener(
    "click",
    function(event){

        const card =
            event.target.closest(
                ".ashub-post"
            );


        if(
            !card ||
            !results.contains(
                card
            )
        ){

            return;

        }


        openPost(
            card.dataset.url
        );

    }
);


/* =========================================================
   KEYBOARD RESULT
========================================================= */

results?.addEventListener(
    "keydown",
    function(event){

        if(
            event.key !== "Enter" &&
            event.key !== " "
        ){

            return;

        }


        const card =
            event.target.closest(
                ".ashub-post"
            );


        if(
            !card ||
            !results.contains(
                card
            )
        ){

            return;

        }


        event.preventDefault();


        openPost(
            card.dataset.url
        );

    }
);


/* =========================================================
   OPEN SEARCH
========================================================= */

openButton?.addEventListener(
    "click",
    openSearchPopup
);


/* =========================================================
   CLOSE SEARCH
========================================================= */

/*
 * The popup is closed ONLY when this
 * Close (×) button is clicked.
 */

closeButton?.addEventListener(
    "click",
    closeSearchPopup
);


/*
 * IMPORTANT:
 *
 * There is intentionally NO overlay
 * click event here.
 *
 * Therefore clicking outside the popup
 * will NOT close it.
 */


/* =========================================================
   SEARCH
========================================================= */

searchButton?.addEventListener(
    "click",
    searchPosts
);


/* =========================================================
   ENTER ON CATEGORY
========================================================= */

categorySelect?.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "Enter"
        ){

            event.preventDefault();

            searchPosts();

        }

    }
);


/* =========================================================
   ENTER ON LOCATION
========================================================= */

locationSelect?.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "Enter"
        ){

            event.preventDefault();

            searchPosts();
        }
    }
);
populateDropdowns();
})();

/* =========================================================
   <!--theAShub Aspirants Post Cards--><!--theAShub Aspirants Post Cards--><!--theAShub Aspirants Post Cards-->
   <!--theAShub Aspirants Post Cards--><!--theAShub Aspirants Post Cards--><!--theAShub Aspirants Post Cards-->
   ========================================================= */
(function(){
"use strict";
/* =========================
   CONFIG
   ========================= */
var ASHUB_CONFIG={
  feedUrl:
    "https://www.theashub.in/feeds/posts/default/-/AspirantsNotifications?max-results=50&alt=json-in-script&callback=ashubReceiveFeed",
  aspirantsUrl:
    "https://www.theashub.in/p/aspirants.html",
  maxPosts:50
};
/* =========================
   BASIC HELPERS
   ========================= */
function escapeHTML(value){
  return String(value||"").replace(
    /[&<>"']/g,
    function(match){
      return {
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
      }[match];
    }
  );
}
function cleanText(text){
  return String(text||"")
    .replace(/\u00a0/g," ")
    .replace(/\s+/g," ")
    .trim();
}
/* =========================
   NEW POST
   WITHIN LAST 10 DAYS
   ========================= */
function isNewPost(date){
  var time=new Date(date).getTime();
  if(!time){
    return false;
  }
  var age=
    (Date.now()-time)/
    86400000;
  /*
    NEW when published within
    the last 10 days.
  */
  return age>=0 && age<=10;
}
function formatDate(date){
  var d=new Date(date);
  if(isNaN(d.getTime())){
    return "";
  }
  return d.toLocaleDateString(
    "en-IN",
    {
      day:"2-digit",
      month:"short",
      year:"numeric"
    }
  );
}
/* =========================
   QUICK INFORMATION
   ONLY FROM:
   .theashub-highlights-quick
   ========================= */
function extractQuickInfo(html){
  var data={
    location:"",
    eligibility:"",
    benefit:"",
    whatToDo:"",
    deadline:"",
    salary:"",
    post:""
  };
  if(!html){
    return data;
  }
  var doc=new DOMParser()
    .parseFromString(
      html,
      "text/html"
    );
  /*
    IMPORTANT:
    Search ONLY inside this container.
  */
  var quick=doc.querySelector(
    ".theashub-highlights-quick"
  );
  if(!quick){
    return data;
  }
  /* First try labelled elements */
  quick.querySelectorAll(
    "span,div,p,li,td,strong,b"
  ).forEach(function(el){
    var text=cleanText(
      el.textContent
    );
    if(!text){
      return;
    }
    var match=text.match(
      /^\s*([^:–—-]+?)\s*[:–—-]\s*(.+)$/i
    );
    if(!match){
      return;
    }
    var label=cleanText(
      match[1]
    ).toLowerCase();
    var value=cleanText(
      match[2]
    );
    if(!value){
      return;
    }
    if(
      !data.location &&
      (
        label==="location" ||
        label==="job location" ||
        label==="place of posting"
      )
    ){
      data.location=value;
    }
    if(
      !data.eligibility &&
      (
        label==="eligibility" ||
        label==="eligible" ||
        label==="qualification" ||
        label==="educational qualification"
      )
    ){
      data.eligibility=value;
    }
    if(
      !data.benefit &&
      (
        label==="benefit" ||
        label==="benefits" ||
        label==="prize" ||
        label==="reward" ||
        label==="cash prize"
      )
    ){
      data.benefit=value;
    }
    if(
      !data.whatToDo &&
      (
        label==="what to do" ||
        label==="how to apply" ||
        label==="application process"
      )
    ){
      data.whatToDo=value;
    }
    if(
      !data.deadline &&
      (
        label==="deadline" ||
        label==="last date" ||
        label==="last date to apply" ||
        label==="closing date" ||
        label==="application deadline" ||
        label==="end date"
      )
    ){
      data.deadline=value;
    }
    if(
      !data.salary &&
      (
        label==="salary" ||
        label==="pay" ||
        label==="pay scale" ||
        label==="stipend" ||
        label==="remuneration"
      )
    ){
      data.salary=value;
    }
    if(
      !data.post &&
      (
        label==="post" ||
        label==="posts" ||
        label==="vacancy" ||
        label==="vacancies"
      )
    ){
      data.post=value;
    }
  });
  /* Support <span><b>Label:</b> Value</span> */
  quick.querySelectorAll(
    "span"
  ).forEach(function(span){
    var bold=span.querySelector(
      "b,strong"
    );
    if(!bold){
      return;
    }
    var label=cleanText(
      bold.textContent
    )
    .replace(/[:\-–—]\s*$/,"")
    .toLowerCase();
    var value=cleanText(
      span.textContent.replace(
        bold.textContent,
        ""
      )
    );
    if(!value){
      return;
    }
    if(
      !data.location &&
      label.indexOf("location")!==-1
    ){
      data.location=value;
    }
    if(
      !data.salary &&
      (
        label.indexOf("salary")!==-1 ||
        label.indexOf("stipend")!==-1 ||
        label.indexOf("remuneration")!==-1
      )
    ){
      data.salary=value;
    }
    if(
      !data.deadline &&
      (
        label.indexOf("deadline")!==-1 ||
        label.indexOf("last date")!==-1
      )
    ){
      data.deadline=value;
    }
    if(
      !data.eligibility &&
      (
        label.indexOf("eligibility")!==-1 ||
        label.indexOf("qualification")!==-1
      )
    ){
      data.eligibility=value;
    }

    if(
      !data.benefit &&
      (
        label.indexOf("benefit")!==-1 ||
        label.indexOf("prize")!==-1 ||
        label.indexOf("reward")!==-1
      )
    ){
      data.benefit=value;
    }
    if(
      !data.whatToDo &&
      (
        label.indexOf("what to do")!==-1 ||
        label.indexOf("how to apply")!==-1
      )
    ){
      data.whatToDo=value;
    }
    if(
      !data.post &&
      (
        label==="post" ||
        label==="posts" ||
        label.indexOf("vacanc")!==-1
      )
    ){
      data.post=value;
    }
  });
  return data;
}
/* =========================
   META
   ========================= */
function buildMeta(data){
  var fields=[
    ["Benefit",data.benefit],
    ["Deadline",data.deadline],
    ["Eligibility",data.eligibility],
    ["Location",data.location],
    ["Post",data.post],
    ["Salary",data.salary],
    ["What to Do",data.whatToDo]
  ];
  var html="";
  fields.forEach(function(field){
    var value=cleanText(
      field[1]
    );
    if(!value){
      return;
    }
    html+=
      '<div class="ashub-meta-item">'+
        '<span class="ashub-meta-label">'+
          escapeHTML(field[0])+
        ':</span> '+
        '<span class="ashub-meta-value">'+
          escapeHTML(value)+
        '</span>'+
      '</div>';
  });
  return html;
}
/* =========================
   CUSTOM CARDS
   ========================= */
function renderCustomCards(){
  document.querySelectorAll(
    '[data-custom-card="true"]'
  ).forEach(function(card){
    var data={
      benefit:card.getAttribute(
        "data-benefit"
      )||"",
      deadline:card.getAttribute(
        "data-deadline"
      )||"",
      eligibility:card.getAttribute(
        "data-eligibility"
      )||"",
      location:card.getAttribute(
        "data-location"
      )||"",
      post:card.getAttribute(
        "data-post"
      )||"",
      salary:card.getAttribute(
        "data-salary"
      )||"",
      whatToDo:card.getAttribute(
        "data-what-to-do"
      )||""
    };
    var meta=card.querySelector(
      ".ashub-meta"
    );
    if(meta){
      meta.innerHTML=
        buildMeta(data);
    }
    /* Add real link */
    var url=card.getAttribute(
      "data-url"
    );
    if(
      url &&
      url!=="#" &&
      !card.querySelector(
        ".ashub-career-card-link"
      )
    ){
      var link=
        document.createElement("a");
      link.className=
        "ashub-career-card-link";
      link.href=url;
      link.target="_blank";
      link.rel=
        "noopener noreferrer";
      link.setAttribute(
        "aria-label",
        "Open post"
      );
      card.insertBefore(
        link,
        card.firstChild
      );
    }
  });
}
/* =========================
   AUTOMATIC CARD
   ========================= */
function createAutomaticCard(entry){
  var linkObj=
    entry.link &&
    entry.link.find(function(link){
      return link.rel==="alternate";
    });
  var link=
    linkObj
      ? linkObj.href
      : "#";
  var title=
    entry.title &&
    entry.title.$t
      ? entry.title.$t
      : "";
  var published=
    entry.published &&
    entry.published.$t
      ? entry.published.$t
      : "";
  var thumbnail=
    entry.media$thumbnail &&
    entry.media$thumbnail.url
      ? entry.media$thumbnail.url
      : "";
  if(thumbnail){
    thumbnail=
      thumbnail.replace(
        "s72-c",
        "s400"
      );
  }
  /*
    ONLY QUICK INFORMATION
    is extracted from the post.
  */
  var data=
    extractQuickInfo(
      entry.content &&
      entry.content.$t
        ? entry.content.$t
        : ""
    );
  var card=
    document.createElement(
      "article"
    );
  card.className=
    "ashub-career-card";
  card.setAttribute(
    "data-automatic-card",
    "true"
  );
  card.setAttribute(
    "data-url",
    link
  );
  /* Real clickable link */
  if(
    link &&
    link!=="#"
  ){
    var cardLink=
      document.createElement(
        "a"
      );
    cardLink.className=
      "ashub-career-card-link";
    cardLink.href=link;
    cardLink.target="_blank";
    cardLink.rel=
      "noopener noreferrer";
    cardLink.setAttribute(
      "aria-label",
      title
    );
    card.appendChild(
      cardLink
    );
  }
  var html="";
  /* Thumbnail */
  if(thumbnail){
    html+=
      '<div class="ashub-career-thumb">'+
        '<img src="'+
          escapeHTML(thumbnail)+
          '" alt="'+
          escapeHTML(title)+
          '" loading="lazy">'+
      '</div>';
  }
  /* Date */
  var date=
    formatDate(
      published
    );
  if(date){
    html+=
      '<div class="ashub-career-date">'+
        escapeHTML(date)+
      '</div>';
  }
  /* Title */
  html+=
    '<div class="ashub-career-title">'+
      escapeHTML(title);
  /*
    NEW TAG:
    Automatically displayed when
    post was published within 10 days.
  */
  if(isNewPost(published)){
    html+=
      '<span class="ashub-new-tag">'+
        'NEW'+
      '</span>';
  }
  html+=
    '</div>';
  /*
    IMPORTANT:
    No post text is displayed here.

    data.post is NOT rendered as
    .ashub-career-description.

    It remains available inside
    Quick Information via buildMeta().
  */

  /* Copy button */
  html+=
    '<button '+
      'class="ashub-copy-btn" '+
      'type="button" '+
      'aria-label="Copy career information" '+
      'onclick="ashubCopyCareerCard(event,this)">'+
      '⧉'+
    '</button>';
  /* Quick Information */
  html+=
    '<div class="ashub-meta">'+
      buildMeta(data)+
    '</div>';
  card.insertAdjacentHTML(
    "beforeend",
    html
  );
  return card;
}
/* =========================
   SORT
   ========================= */

function sortEntriesByLatest(
  entries
){
  return entries.sort(
    function(a,b){
      var dateA=new Date(
        a.published &&
        a.published.$t
          ? a.published.$t
          : 0
      ).getTime();
      var dateB=new Date(
        b.published &&
        b.published.$t
          ? b.published.$t
          : 0
      ).getTime();
      return dateB-dateA;
    }
  );
}


/* =========================
   MERGE
   ========================= */
function mergePosts(){
  var grid=
    document.getElementById(
      "ashubCareersGrid"
    );
  if(!grid){
    return;
  }
  var customCards=
    Array.prototype.slice.call(
      grid.querySelectorAll(
        '[data-custom-card="true"]'
      )
    );


  var automaticCards=
    Array.prototype.slice.call(
      grid.querySelectorAll(
        '[data-automatic-card="true"]'
      )
    );
  var customByPosition={};
  customCards.forEach(
    function(card){
      var position=parseInt(
        card.getAttribute(
          "data-position"
        ),
        10
      );
      if(
        !position ||
        position<1
      ){
        return;
      }


      if(
        !customByPosition[position]
      ){
        customByPosition[position]=[];
      }


      customByPosition[position]
        .push(card);

    }
  );


  grid.innerHTML="";


  var autoIndex=0;
  var finalPosition=1;


  while(
    autoIndex<automaticCards.length ||
    Object.keys(
      customByPosition
    ).some(function(pos){

      return(
        parseInt(pos,10)>=
        finalPosition
      );

    })
  ){

    var customHere=
      customByPosition[
        finalPosition
      ];


    if(customHere){

      customHere.forEach(
        function(card){

          grid.appendChild(
            card
          );

        }
      );


    }else if(
      autoIndex<
      automaticCards.length
    ){

      grid.appendChild(
        automaticCards[
          autoIndex
        ]
      );

      autoIndex++;

    }


    finalPosition++;


    if(finalPosition>500){
      break;
    }

  }


  /* Invalid positions */

  customCards.forEach(
    function(card){

      var position=parseInt(
        card.getAttribute(
          "data-position"
        ),
        10
      );


      if(
        !position ||
        position<1
      ){
        grid.appendChild(card);
      }

    }
  );

}


/* =========================
   BLOGGER CALLBACK
   ========================= */

window.ashubReceiveFeed=
  function(json){

    var grid=
      document.getElementById(
        "ashubCareersGrid"
      );


    if(!grid){
      return;
    }


    var entries=
      json &&
      json.feed &&
      json.feed.entry
        ? json.feed.entry.slice()
        : [];


    entries=
      sortEntriesByLatest(
        entries
      );


    entries=
      entries.slice(
        0,
        ASHUB_CONFIG.maxPosts
      );


    /* Remove skeleton */

    grid.querySelectorAll(
      ".ashub-loading-card"
    ).forEach(
      function(card){
        card.remove();
      }
    );


    /* Remove old automatic cards */

    grid.querySelectorAll(
      '[data-automatic-card="true"]'
    ).forEach(
      function(card){
        card.remove();
      }
    );


    /* No posts */

    if(!entries.length){

      if(
        !grid.querySelector(
          '[data-custom-card="true"]'
        )
      ){

        grid.innerHTML=
          '<div class="ashub-career-empty">'+
            'No posts available right now.'+
          '</div>';

        return;
      }

    }


    /* Create automatic posts */

    entries.forEach(
      function(entry){

        grid.appendChild(
          createAutomaticCard(
            entry
          )
        );

      }
    );


    renderCustomCards();


    mergePosts();

  };


/* =========================
   COPY
   ========================= */

window.ashubCopyCareerCard=
  function(event,button){

    if(event){

      event.preventDefault();
      event.stopPropagation();

    }


    var card=
      button.closest(
        ".ashub-career-card"
      );


    if(!card){
      return;
    }


    var titleElement=
      card.querySelector(
        ".ashub-career-title"
      );


    var descriptionElement=
      card.querySelector(
        ".ashub-career-description"
      );


    var metaElements=
      card.querySelectorAll(
        ".ashub-meta-item"
      );


    var title=
      titleElement
        ? cleanText(
            titleElement.innerText
          )
        : "";


    var description=
      descriptionElement
        ? cleanText(
            descriptionElement.innerText
          )
        : "";


    var meta=[];


    metaElements.forEach(
      function(item){

        var text=
          cleanText(
            item.innerText
          );


        if(text){
          meta.push(text);
        }

      }
    );


    var content="";


    if(title){

      content+=
        title+
        "\n\n";

    }


    if(description){

      content+=
        description+
        "\n\n";

    }


    if(meta.length){

      content+=
        meta.join("\n")+
        "\n\n";

    }


    content+=
      "More details:\n"+
      ASHUB_CONFIG.aspirantsUrl;
    if(
      navigator.clipboard &&
      window.isSecureContext
    ){
      navigator.clipboard
        .writeText(content)
        .then(function(){
          ashubShowCopied(
            button
          );
        })
        .catch(function(){
          ashubFallbackCopy(
            content,
            button
          );
        });
    }else{
      ashubFallbackCopy(
        content,
        button
      );
    }
  };
/* =========================
   FALLBACK COPY
   ========================= */
function ashubFallbackCopy(
  text,
  button
){
  var textarea=
    document.createElement(
      "textarea"
    );
  textarea.value=text;
  textarea.style.position="fixed";
  textarea.style.left="-9999px";
  textarea.style.top="0";
  document.body.appendChild(
    textarea
  );
  textarea.focus();
  textarea.select();
  try{
    document.execCommand(
      "copy"
    );
    ashubShowCopied(
      button
    );
  }catch(error){
    alert(
      "Unable to copy. Please copy the text manually."
    );
  }
  document.body.removeChild(
    textarea
  );
}
/* =========================
   COPY SUCCESS
   ========================= */
function ashubShowCopied(
  button
){
  var oldText=
    button.innerHTML;
  button.innerHTML="✓";
  button.classList.add(
    "copied"
  );
  var toast=
    document.getElementById(
      "ashubCopyToast"
    );
  if(toast){
    toast.classList.add(
      "show"
    );
    setTimeout(
      function(){
        toast.classList.remove(
          "show"
        );
      },
      1800
    );
  }
  setTimeout(
    function(){
      button.innerHTML=
        oldText;
      button.classList.remove(
        "copied"
      );
    },
    1500
  );
}
renderCustomCards();
var feedScript=
  document.createElement(
    "script"
  );
feedScript.src=
  ASHUB_CONFIG.feedUrl;
feedScript.async=true;
document.body.appendChild(
  feedScript
);
})();

/* =========================================================
   <!--theAShub Learners Post Cards--><!--theAShub Learners Post Cards--><!--theAShub Learners Post Cards-->
   <!--theAShub Learners Post Cards--><!--theAShub Learners Post Cards--><!--theAShub Learners Post Cards-->
   ========================================================= */
(function(){
"use strict";
var ASHUB_CONFIG={
  feedUrl:
    "https://www.theashub.in/feeds/posts/default/-/LearnersNotifications?max-results=50&alt=json-in-script&callback=ashubReceiveFeed",
  aspirantsUrl:
    "https://www.theashub.in/p/learners.html",
  maxPosts:50
};
function escapeHTML(value){
  return String(value||"").replace(
    /[&<>"']/g,
    function(match){
      return {
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
      }[match];
    }
  );
}
function cleanText(text){
  return String(text||"")
    .replace(/\u00a0/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function isNewPost(date){
  var time=
    new Date(date).getTime();
  if(!time){
    return false;
  }
  var age=
    (Date.now()-time)/
    86400000;
  return age>=0 && age<=10;
}
function formatDate(date){
  var d=
    new Date(date);
  if(isNaN(d.getTime())){
    return "";
  }
  return d.toLocaleDateString(
    "en-IN",
    {
      day:"2-digit",
      month:"short",
      year:"numeric"
    }
  );
}
function extractQuickInfo(html){
  var data={
    eligibility:"",
    course:"",
    deadline:"",
    benefit:"",
    selectionProcess:""
  };
  if(!html){
    return data;
  }
  var doc=
    new DOMParser()
      .parseFromString(
        html,
        "text/html"
      );
  var quick=
    doc.querySelector(
      ".theashub-highlights-quick"
    );
  if(!quick){
    return data;
  }
  quick.querySelectorAll(
    "span,div,p,li,td,strong,b"
  ).forEach(function(el){
    var text=
      cleanText(
        el.textContent
      );
    if(!text){
      return;
    }
    var match=
      text.match(
        /^\s*([^:–—-]+?)\s*[:–—-]\s*(.+)$/i
      );
    if(!match){
      return;
    }
    var label=
      cleanText(
        match[1]
      ).toLowerCase();
    var value=
      cleanText(
        match[2]
      );
    if(!value){
      return;
    }
    if(
      !data.eligibility &&
      (
        label==="eligibility" ||
        label==="eligible" ||
        label==="qualification" ||
        label==="educational qualification"
      )
    ){
      data.eligibility=value;
    }
    if(
      !data.course &&
      (
        label==="course" ||
        label==="courses" ||
        label==="program" ||
        label==="programme"
      )
    ){
      data.course=value;
    }
    if(
      !data.deadline &&
      (
        label==="deadline" ||
        label==="last date" ||
        label==="last date to apply" ||
        label==="closing date" ||
        label==="application deadline" ||
        label==="end date"
      )
    ){
      data.deadline=value;
    }
    if(
      !data.benefit &&
      (
        label==="benefit" ||
        label==="benefits" ||
        label==="prize" ||
        label==="reward" ||
        label==="cash prize"
      )
    ){
      data.benefit=value;
    }
    if(
      !data.selectionProcess &&
      (
        label==="selection process" ||
        label==="selection" ||
        label==="selection procedure"
      )
    ){
      data.selectionProcess=value;
    }
  });
  quick.querySelectorAll(
    "span"
  ).forEach(function(span){
    var bold=
      span.querySelector(
        "b,strong"
      );
    if(!bold){
      return;
    }
    var label=
      cleanText(
        bold.textContent
      )
      .replace(
        /[:\-–—]\s*$/,
        ""
      )
      .toLowerCase();
    var value=
      cleanText(
        span.textContent.replace(
          bold.textContent,
          ""
        )
      );
    if(!value){
      return;
    }
    if(
      !data.eligibility &&
      (
        label.indexOf("eligibility")!==-1 ||
        label.indexOf("qualification")!==-1
      )
    ){
      data.eligibility=value;
    }
    if(
      !data.course &&
      (
        label==="course" ||
        label==="courses" ||
        label.indexOf("program")!==-1 ||
        label.indexOf("programme")!==-1
      )
    ){

      data.course=value;
    }
    if(
      !data.deadline &&
      (
        label.indexOf("deadline")!==-1 ||
        label.indexOf("last date")!==-1
      )
    ){
      data.deadline=value;
    }
    if(
      !data.benefit &&
      (
        label.indexOf("benefit")!==-1 ||
        label.indexOf("prize")!==-1 ||
        label.indexOf("reward")!==-1
      )
    ){
      data.benefit=value;
    }
    if(
      !data.selectionProcess &&
      (
        label.indexOf("selection process")!==-1 ||
        label==="selection" ||
        label.indexOf("selection procedure")!==-1
      )
    ){
      data.selectionProcess=value;
    }
  });
  return data;
}
function buildMeta(data){
  var fields=[
    ["Eligibility",data.eligibility],
    ["Course",data.course],
    ["Deadline",data.deadline],
    ["Benefit",data.benefit],
    ["Selection Process",data.selectionProcess]
  ];
  var html="";
  fields.forEach(function(field){
    var value=
      cleanText(
        field[1]
      );


    if(!value){
      return;
    }


    html+=

      '<div class="ashub-meta-item">'+

        '<span class="ashub-meta-label">'+
          escapeHTML(field[0])+
        ':</span> '+

        '<span class="ashub-meta-value">'+
          escapeHTML(value)+
        '</span>'+

      '</div>';

  });


  return html;

}


/* =========================
   CUSTOM CARDS
   ONLY FIVE FIELDS
   ========================= */

function renderCustomCards(){

  document.querySelectorAll(
    '[data-custom-card="true"]'
  ).forEach(function(card){

    var data={

      eligibility:
        card.getAttribute(
          "data-eligibility"
        )||"",

      course:
        card.getAttribute(
          "data-course"
        )||"",

      deadline:
        card.getAttribute(
          "data-deadline"
        )||"",

      benefit:
        card.getAttribute(
          "data-benefit"
        )||"",

      selectionProcess:
        card.getAttribute(
          "data-selection-process"
        )||""

    };


    var meta=
      card.querySelector(
        ".ashub-meta"
      );


    if(meta){

      meta.innerHTML=
        buildMeta(data);

    }


    /* REAL LINK */

    var url=
      card.getAttribute(
        "data-url"
      );


    if(
      url &&
      url!=="#" &&
      !card.querySelector(
        ".ashub-career-card-link"
      )
    ){

      var link=
        document.createElement(
          "a"
        );


      link.className=
        "ashub-career-card-link";


      link.href=url;


      link.target="_blank";


      link.rel=
        "noopener noreferrer";


      link.setAttribute(
        "aria-label",
        "Open post"
      );


      card.insertBefore(
        link,
        card.firstChild
      );
    }
  });
}
function createAutomaticCard(entry){
  var linkObj=
    entry.link &&
    entry.link.find(
      function(link){
        return link.rel==="alternate";
      }
    );
  var link=
    linkObj
      ? linkObj.href
      : "#";
  var title=
    entry.title &&
    entry.title.$t
      ? entry.title.$t
      : "";
  var published=
    entry.published &&
    entry.published.$t
      ? entry.published.$t
      : "";
  var thumbnail=
    entry.media$thumbnail &&
    entry.media$thumbnail.url
      ? entry.media$thumbnail.url
      : "";


  if(thumbnail){

    thumbnail=
      thumbnail.replace(
        "s72-c",
        "s400"
      );
  }
  var data=
    extractQuickInfo(
      entry.content &&
      entry.content.$t
        ? entry.content.$t
        : ""
    );
  var card=
    document.createElement(
      "article"
    );
  card.className=
    "ashub-career-card";


  card.setAttribute(
    "data-automatic-card",
    "true"
  );
  card.setAttribute(
    "data-url",
    link
  );
  if(
    link &&
    link!=="#"
  ){
    var cardLink=
      document.createElement(
        "a"
      );
    cardLink.className=
      "ashub-career-card-link";
    cardLink.href=link;
    cardLink.target="_blank";
    cardLink.rel=
      "noopener noreferrer";
    cardLink.setAttribute(
      "aria-label",
      title
    );
    card.appendChild(
      cardLink
    );
  }
  var html="";
  /* THUMBNAIL */
  if(thumbnail){
    html+=
      '<div class="ashub-career-thumb">'+
        '<img src="'+
          escapeHTML(thumbnail)+
          '" alt="'+
          escapeHTML(title)+
          '" loading="lazy">'+

      '</div>';

  }


  /* DATE */

  var date=
    formatDate(
      published
    );


  if(date){

    html+=

      '<div class="ashub-career-date">'+
        escapeHTML(date)+
      '</div>';

  }


  /* TITLE */

  html+=

    '<div class="ashub-career-title">'+
      escapeHTML(title);


  /* NEW TAG */

  if(
    isNewPost(
      published
    )
  ){

    html+=

      '<span class="ashub-new-tag">'+
        'NEW'+
      '</span>';

  }


  html+=
    '</div>';


  /*
    NO POST BODY TEXT
  */


  /* COPY BUTTON */

  html+=

    '<button '+
      'class="ashub-copy-btn" '+
      'type="button" '+
      'aria-label="Copy career information" '+
      'onclick="ashubCopyCareerCard(event,this)">'+
      '⧉'+
    '</button>';


  /* QUICK INFORMATION */

  html+=

    '<div class="ashub-meta">'+
      buildMeta(data)+
    '</div>';


  card.insertAdjacentHTML(
    "beforeend",
    html
  );


  return card;

}


/* =========================
   SORT
   ========================= */

function sortEntriesByLatest(
  entries
){

  return entries.sort(
    function(a,b){

      var dateA=
        new Date(
          a.published &&
          a.published.$t
            ? a.published.$t
            : 0
        ).getTime();


      var dateB=
        new Date(
          b.published &&
          b.published.$t
            ? b.published.$t
            : 0
        ).getTime();


      return dateB-dateA;

    }
  );

}


/* =========================
   MERGE
   ========================= */

function mergePosts(){

  var grid=
    document.getElementById(
      "ashubCareersGrid"
    );


  if(!grid){
    return;
  }


  var customCards=
    Array.prototype.slice.call(
      grid.querySelectorAll(
        '[data-custom-card="true"]'
      )
    );


  var automaticCards=
    Array.prototype.slice.call(
      grid.querySelectorAll(
        '[data-automatic-card="true"]'
      )
    );


  var customByPosition={};


  customCards.forEach(
    function(card){

      var position=
        parseInt(
          card.getAttribute(
            "data-position"
          ),
          10
        );


      if(
        !position ||
        position<1
      ){

        return;

      }


      if(
        !customByPosition[position]
      ){

        customByPosition[position]=[];

      }


      customByPosition[position]
        .push(card);

    }
  );


  grid.innerHTML="";


  var autoIndex=0;

  var finalPosition=1;


  while(

    autoIndex<
      automaticCards.length ||

    Object.keys(
      customByPosition
    ).some(
      function(pos){

        return(
          parseInt(pos,10)>=
          finalPosition
        );

      }
    )

  ){

    var customHere=
      customByPosition[
        finalPosition
      ];


    if(customHere){

      customHere.forEach(
        function(card){

          grid.appendChild(
            card
          );

        }
      );


    }else if(
      autoIndex<
      automaticCards.length
    ){

      grid.appendChild(
        automaticCards[
          autoIndex
        ]
      );


      autoIndex++;

    }


    finalPosition++;


    if(
      finalPosition>500
    ){

      break;

    }

  }


  /* INVALID POSITIONS */

  customCards.forEach(
    function(card){

      var position=
        parseInt(
          card.getAttribute(
            "data-position"
          ),
          10
        );


      if(
        !position ||
        position<1
      ){

        grid.appendChild(
          card
        );

      }

    }
  );

}


/* =========================
   BLOGGER CALLBACK
   ========================= */

window.ashubReceiveFeed=
  function(json){

    var grid=
      document.getElementById(
        "ashubCareersGrid"
      );


    if(!grid){
      return;
    }


    var entries=
      json &&
      json.feed &&
      json.feed.entry
        ? json.feed.entry.slice()
        : [];


    entries=
      sortEntriesByLatest(
        entries
      );


    entries=
      entries.slice(
        0,
        ASHUB_CONFIG.maxPosts
      );


    /* REMOVE SKELETON */

    grid.querySelectorAll(
      ".ashub-loading-card"
    ).forEach(
      function(card){

        card.remove();

      }
    );


    /* REMOVE OLD AUTOMATIC CARDS */

    grid.querySelectorAll(
      '[data-automatic-card="true"]'
    ).forEach(
      function(card){

        card.remove();

      }
    );


    /* NO POSTS */

    if(!entries.length){

      if(
        !grid.querySelector(
          '[data-custom-card="true"]'
        )
      ){

        grid.innerHTML=

          '<div class="ashub-career-empty">'+
            'No posts available right now.'+
          '</div>';

        return;

      }

    }


    /* CREATE AUTOMATIC POSTS */

    entries.forEach(
      function(entry){

        grid.appendChild(
          createAutomaticCard(
            entry
          )
        );

      }
    );


    renderCustomCards();


    mergePosts();

  };


/* =========================
   COPY
   ========================= */

window.ashubCopyCareerCard=
  function(event,button){

    if(event){

      event.preventDefault();

      event.stopPropagation();

    }


    var card=
      button.closest(
        ".ashub-career-card"
      );


    if(!card){
      return;
    }


    var titleElement=
      card.querySelector(
        ".ashub-career-title"
      );


    var descriptionElement=
      card.querySelector(
        ".ashub-career-description"
      );


    var metaElements=
      card.querySelectorAll(
        ".ashub-meta-item"
      );


    var title=
      titleElement
        ? cleanText(
            titleElement.innerText
          )
        : "";


    var description=
      descriptionElement
        ? cleanText(
            descriptionElement.innerText
          )
        : "";


    var meta=[];


    metaElements.forEach(
      function(item){

        var text=
          cleanText(
            item.innerText
          );


        if(text){

          meta.push(
            text
          );

        }

      }
    );


    var content="";


    if(title){

      content+=
        title+
        "\n\n";

    }


    if(description){

      content+=
        description+
        "\n\n";

    }


    if(meta.length){

      content+=
        meta.join("\n")+
        "\n\n";

    }


    content+=
      "More details:\n"+
      ASHUB_CONFIG.aspirantsUrl;


    if(
      navigator.clipboard &&
      window.isSecureContext
    ){

      navigator.clipboard
        .writeText(content)
        .then(function(){

          ashubShowCopied(
            button
          );

        })
        .catch(function(){

          ashubFallbackCopy(
            content,
            button
          );

        });

    }else{

      ashubFallbackCopy(
        content,
        button
      );

    }

  };


/* =========================
   FALLBACK COPY
   ========================= */

function ashubFallbackCopy(
  text,
  button
){

  var textarea=
    document.createElement(
      "textarea"
    );


  textarea.value=text;


  textarea.style.position=
    "fixed";

  textarea.style.left=
    "-9999px";

  textarea.style.top=
    "0";


  document.body.appendChild(
    textarea
  );


  textarea.focus();

  textarea.select();


  try{

    document.execCommand(
      "copy"
    );


    ashubShowCopied(
      button
    );


  }catch(error){

    alert(
      "Unable to copy. Please copy the text manually."
    );

  }


  document.body.removeChild(
    textarea
  );

}


/* =========================
   COPY SUCCESS
   ========================= */

function ashubShowCopied(
  button
){

  var oldText=
    button.innerHTML;


  button.innerHTML=
    "✓";


  button.classList.add(
    "copied"
  );


  var toast=
    document.getElementById(
      "ashubCopyToast"
    );


  if(toast){

    toast.classList.add(
      "show"
    );


    setTimeout(
      function(){

        toast.classList.remove(
          "show"
        );

      },
      1800
    );

  }


  setTimeout(
    function(){
      button.innerHTML=
        oldText;
      button.classList.remove(
        "copied"
      );
    },
    1500
  );
}
renderCustomCards();
var feedScript=
  document.createElement(
    "script"
  );
feedScript.src=
  ASHUB_CONFIG.feedUrl;
feedScript.async=true;
document.body.appendChild(
  feedScript
);
})();
