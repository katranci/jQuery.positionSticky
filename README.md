jQuery.positionSticky
=====================
This is a jQuery plugin definition for the [vanilla PositionSticky library](https://github.com/katranci/PositionSticky).
For code metrics, unit tests, issues please refer to the [PositionSticky library](https://github.com/katranci/PositionSticky).

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

```javascript
$('#sticky').positionSticky();  
```

Examples
--------
* [Simple usage](http://katranci.github.io/jQuery.positionSticky/demos/demo1.html)
* [Support for display and float properties](http://katranci.github.io/jQuery.positionSticky/demos/demo2.html)
* [Refresh functionality](http://katranci.github.io/jQuery.positionSticky/demos/refresh.html)
* [A sidebar example](http://katranci.github.io/jQuery.positionSticky/demos/sidebar.html)


Browser Support
---------------
* Chrome
* Firefox
* Safari
* IE9+
