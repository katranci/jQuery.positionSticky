vanilla-position-sticky
=======================

```
 --------------------------  
|                          |=> window
|   --------------------   |
|  |                    |==|=> container
|  |              ---   |  |
|  |             |   |==|==|=> sticky
|  |             |   |  |  |  
|  |              ---   |  |
|  |                    |  |
|  |                    |  |
|  |                    |  |
|  |                    |  |
```

```
var element = document.getElementById('sticky');
var sticky  = PositionSticky.create(element);  
```


* Browser Support: IE9+
