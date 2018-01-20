/*
   Client-side js
   run by the browser each time your view template is loaded

   by default, you've got jQuery,
   add other scripts at the bottom of index.html
*/
function copy() {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($('#url').text()).select();
  document.execCommand("copy");
  $temp.remove();
}

$('form').submit(event => {
   event.preventDefault()
   const url = $('input').val()
   $.post('/shorten?' + $.param({url}), urlJSON => {
     if(urlJSON === 'Invalid URL syntax.') {
       $('p#url').text(urlJSON)
       $('input').val('')
       $('input').focus()
       return
     }
     const url = JSON.parse(urlJSON).shortURL
     $('p#url').text(url)
     $('input').val('')
     $('input').focus()
   })
})

