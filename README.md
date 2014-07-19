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
Please check `demos` folder


Browser Support
---------------
* Chrome
* Firefox
* Safari
* IE9+
