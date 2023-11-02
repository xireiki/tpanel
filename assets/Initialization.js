(function(){
  
  if(false || !! window.MSInpoutMethodContext || !!document.documentMode){
    alert( '请勿使用 IE 浏览器！' )
    throw( new Error( '请勿使用 IE 浏览器！' ) )
  }

  var Sys = {}
  var ua = navigator.userAgent.toLowerCase()
  var s = void 0;
  ( s = ua.match( /edg\/([\d.]+)/ ) )
  ? ( Sys.edg = s[ 1 ] )
  : ( s = ua.match( /firefox\/([\d.]+)/ ) )
  ? ( Sys.firefox = s[ 1 ] )
  : ( s = ua.match( /chrome\/([\d.]+)/ ) )
  ? ( Sys.chrome = s[ 1 ] )
  : ( s = ua.match( /opera\.([\d.]+)/ ) )
  ? ( Sys.opera = s[ 1 ] )
  : ( s = ua.match( /version\/([\d.]+).*safari/ ) )
  ? ( Sys.safari = s[ 1 ] )
  : void 0

  var version = parseInt( Object.values( Sys )[ 0 ].split( '.' )[ 0 ], 10 )

  if ( version < 42 ) {
    var message = '检测到您的浏览器内核版本为 ' + version + '，请将其升级到 42 以上，否则将出现无法预料的问题！！'
    alert( message )
    throw( new Error( message ) )
  }
})()