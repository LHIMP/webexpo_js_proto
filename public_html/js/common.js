$(document).ready(function(e) {
  $('#obsValues').on('keydown', allowTabPress)
})

function allowTabPress(event)
{
  $targ = $(event.target)
  if ( event.keyCode == 9 ) {
    event.preventDefault()
    let range = $targ.range()
    let val = $targ.val()
    $targ.val(`${val.substr(0, range.start)}${"\t"}${val.substr(range.end)}`)
    $targ.caret(range.start+1)
    return false
  }
}

function initLocale()
{
  $.i18n.debug = true;
        
  var url = new URL(window.location.href);
  var lang = url.searchParams.get('lang');
  lang = lang == null ? 'fr' : lang.toLowerCase();
  $.i18n.locale = lang;
}

function translatePage()
{
  var i18n = $.i18n({locale: $.i18n.locale});
  $('body').attr('data-lang', $.i18n.locale);
  $('body').data('trans-done', 0)
  $.i18n().load( `i18n/trans-${i18n.locale}.json`, i18n.locale ).done(function(x) {
    $('html').i18n();
    $('body').data('trans-done', 1)
  });
  $('.lang-switcher .lang').each(function() {
    var this_locale = $(this)[0].classList[1];
    if ( $.i18n.locale != this_locale ) {
      $(this).attr('href', window.location.origin + window.location.pathname + "?lang=" + this_locale);
    } else {
      $(this).replaceWith("<span class='lang selected'>" + $(this).text() + "</span>");
    }
  });
}

function downloadTraceplot(mcmcParam) {
  let modelType = typeof(zygotine.SEG) !== "undefined" ? "SEG" : "BW"
  let burninChain = zygotine[modelType].lastModel.result.chains[`${mcmcParam.name}Burnin`].data
  let mainChain = zygotine[modelType].lastModel.result.chains[`${mcmcParam.name}Sample`].data
  if ( mainChain.length > 0 ) {
    let plotElem = document.createElement('div')
    let data = [
      {
        x: [...Array(burninChain.length).keys()].map(x => x+1),
        y: burninChain,
        line: {
          color: 'red'
        },
        name: 'Burnin'
      },
      {
        x: [...Array(mainChain.length).keys()].map(x => burninChain.length+x+1),
        y: mainChain,
        line: {
          color: "#1f77b4"
        },
        name: $.i18n('Posterior sample')
      }
    ]
    
    var layout = {
      title: {
        text: `${$.i18n('traceplot-title')} <i>${mcmcParam.symbol}</i>`,
        font: {
          family: 'Arial Black', 
          color: 'black',
          size: 16
        },
        y: 0.98,
        yanchor: 'top'
      },
      xaxis: {
        title: $.i18n('Iteration'),
        range: [0, burninChain.length + mainChain.length + 500],
        gridcolor: 'darkgrey',
        dtick: 1000
      },
      yaxis: {
        title: mcmcParam.symbol,
        showgrid: false
      },
      margin: {
        t: 0
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        borderwidth: 1
      }
    }
    
    Plotly.newPlot(
      plotElem,
      data,
      layout
    ).then(function(gd) {
      let now = new Date()
      let dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) 
      let [{ value: month },,{ value: day },,{ value: year },,{ value: hour },,{ value: minute },,{ value: sec },,] = dateTimeFormat .formatToParts(now) 
      let plotFilename = `${$.i18n('traceplot-filename')}_${mcmcParam.symbol.replace(/<[^>]+>(?=.)/g, '_').replace(/<[^>]+>$/, '')}_${year}${month}${day}_${hour}${minute}${sec}`
      Plotly.downloadImage(gd, {
        format: 'png',
        height: 600,
        width: 1000,
        filename: plotFilename
      })
      /* gd.remove() */
    })
  }
}