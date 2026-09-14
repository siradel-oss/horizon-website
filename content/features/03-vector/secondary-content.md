```
if (attr("date") > "2025-12-31") {
    discard;
}
set "radius" = div(attr("users"), 1000);
set "color" = lighten(attr("color"), 0.2);
emit "cylinder";
```
