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