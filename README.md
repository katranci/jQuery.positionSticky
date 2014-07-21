vanilla-position-sticky
=======================

Usage
-----

```
 -------------------------- => window 
|   --------------------   |
|  |              ---   |==|=> container
|  |             |   |  |  |
|  |             |   |==|==|=> sticky  
|  |              ---   |  |
|  |                    |  |
|  |                    |  |
|  |                    |  |
|  |                    |  |
|   --------------------   |
|   --------------------   |
|  |                    |  |
|  |                    |  |

```

```
var element = document.getElementById('sticky');
var sticky  = PositionSticky.create(element);  
```

Examples
--------
* [Simple usage](http://katranci.github.io/vanilla-position-sticky/demos/demo1.html)
* [Support for display and float properties](http://katranci.github.io/vanilla-position-sticky/demos/demo2.html)
* [Refresh functionality](http://katranci.github.io/vanilla-position-sticky/demos/refresh.html)
* [A sidebar example](http://katranci.github.io/vanilla-position-sticky/demos/sidebar.html)


Browser Support
---------------
* Chrome
* Firefox
* Safari
* IE9+
