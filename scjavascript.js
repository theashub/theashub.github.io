<script>
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
</script>
