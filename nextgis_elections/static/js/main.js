var NGe = {};

NGe.tlayer = {}; // тематические слои по уровням


NGe.setLevel = function (level, root) {
    if (root == undefined) { root = NGe.rootUnit; };

    // собираем ссылку
    var geom = 'polygon';
    if (level == 4) { geom = 'point'; };
    var url = NGe.routes.data + '?srs=900913&geom=' + geom + '&root=' + root ;

    // выбранный слой
    var layer;
    if (level >=2 & level <=4 & NGe.tlayer[level] == undefined) {
        // инициализируем слой
        layer = new OpenLayers.Layer.Vector("layer" + level, {
            rendererOptions: {zIndexing: true},
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.Script({
                url: url
            }),
            visibile: true
        });
        NGe.map.addLayer(layer);
        NGe.tlayer[level] = layer;
        
        // "раскраску нужно каждый раз обновлять, т.к. она на минимумы и максимумы завязана"
        layer.events.register("loadend", layer, function (e) {
            NGe.setRenderer(NGe.currentRenderer, NGe.currentRendererArgs);
        })

        NGe.cntrlHover.setLayer(NGe.cntrlHover.layers.concat([layer]));
        NGe.cntrlSelect.setLayer(NGe.cntrlSelect.layers.concat([layer]));
    } else {
        // используем существующий
        layer = NGe.tlayer[level];
        layer.setVisibility(true);
        layer.refresh({'url': url});
    };

    // остальные выключаем
    for (var l in NGe.tlayer) {
        if (l != level) { NGe.tlayer[l].setVisibility(false); };
    };

    NGe.currentLevel = level;
    NGe.currentRoot = root;

    switch (NGe.currentLevel) {
        case 2:
            break;
        case 3:
            break;
        case 4:
            console.log(root);
            break;
    }

	if (NGe.currentLevel == 2) {putBreadCrumbs(); map.zoomToExtent(new OpenLayers.Bounds(4108911.9527615,7430730.8105945,4261786.0093105,7583604.8671435));}
    /*if (NGe.currentLevel == 3) {
        var parent_id = NGe.tlayer[4].features[1].attributes.unit.parent_id;
		for (var i = 0; i < NGe.tlayer[3].features.length; i += 1) {
		    if (NGe.tlayer[3].features[i].attributes.unit.id == parent_id) {
			    putBreadCrumbs(NGe.tlayer[3].features[i]);
				map.zoomToExtent(NGe.tlayer[3].features[i].getBounds());
				break;
			}
		}
	}*/

};

var map, api;



function init() {

    var trigger = $('#holder');
    
    //Tooltip settings
    trigger.tooltip({
        events: {
            tooltip: 'mouseenter'
        },
        offset: [1, 1],
        tip: $('.tooltip')
    });
    api = trigger.data('tooltip');
    
    
    geojson_format = new OpenLayers.Format.GeoJSON();
    OpenLayers.ImgPath = "http://js.mapbox.com/theme/dark/";

    map = new OpenLayers.Map('map', {
        maxExtent: new OpenLayers.Bounds(4133471.04,7457808.76,4226219.99,7562641.88),
        //restrictedExtent: new OpenLayers.Bounds(4133471.04,7457808.76,4226219.99,7562641.88),
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:900913")
    });
    NGe.map = map;

    // подложки
    layerMapnik = new OpenLayers.Layer.OSM.Mapnik("OSM ", {baseLayer: true, attribution: false, opacity: 0.5});
    map.addLayer(layerMapnik);

   
    //Контролы
    NGe.cntrlHover = new OpenLayers.Control.SelectFeature(
        [], {
            hover: true,
            highlightOnly: true,
            autoActivate: true,
            eventListeners: {
                featurehighlighted: function (e) {
                    showTooltip(e.feature);
                },
                featureunhighlighted: function () {
                    hideTooltip();
                }
            }
        }
    );

    NGe.cntrlSelect = new OpenLayers.Control.SelectFeature(
        [], {
            hover: false,
            autoActivate: true,
            renderIntent: "default",
            onSelect: function (f) {
                if (NGe.currentLevel !== 4) {
                    NGe.setLevel(f.attributes.unit.level+1, f.attributes.unit.id);
                    map.zoomToExtent(f.geometry.getBounds());
                }
                hideTooltip();
            }
        }
    );

    NGe.cntrlHover.handlers.feature.stopDown = false;
    NGe.cntrlSelect.handlers.feature.stopDown = false;

    map.addControls([NGe.cntrlHover, NGe.cntrlSelect]);

    map.zoomToExtent(new OpenLayers.Bounds(4108911.9527615,7430730.8105945,4261786.0093105,7583604.8671435));
    NGe.setLevel(2);

}


function showTooltip(f) {
    var trigger = api.getTrigger(),
        coords = f.layer.map.getPixelFromLonLat(f.geometry.getBounds().getCenterLonLat()),
        tX = coords.x,
        tY = coords.y,
        ttContent = '';
        trigger.css({'left': tX + 'px', 'top': tY + 'px'});

        for (var i = 1; i < 8; i += 1) {
            ttContent_o = "<tr>\
                              <td class='t'><a href='#'>" + NGe.parties[i].name + "</a></td>\
                              <td class='c'>" + f.attributes.protocol_o.vote_c[i] + "</td>\
                              <td>" + (100 * f.attributes.protocol_o.vote_p[i]).toFixed(2) + "%</td>";
            if (f.attributes.protocol_i !== null) {
                ttContent_i = "<td>" + f.attributes.protocol_i.vote_c[i] + "</td>\
                               <td class='c'>" + (100 * f.attributes.protocol_i.vote_p[i]).toFixed(2) + "%</td>\
                           </tr>";
                }
                else {
                    ttContent_i = "</tr>";
                }
            ttContent = ttContent + ttContent_o + ttContent_i;
        }

        if (f.attributes.protocol_i !== null) {
            api.getConf().tip.html(
                "<div id='map_popup'>\
                    <div class='content'>\
                    <h3>" + f.attributes.unit.name + "</h3>\
                    <table>\
                        <tr>\
                            <th></th>\
                            <th colspan='2'><a href='#'>Подсчёт ЦИК</a></th>\
                            <th colspan='2'><a href='#'>Независимый подсчет</a></th>\
                        </tr>" + ttContent + "\
                    </table>\
                </div><span class='arrow'></span></div>"
            );
        }
        else {
            api.getConf().tip.html(
                "<div id='map_popup'>\
                    <div class='content'>\
                    <h3>" + f.attributes.unit.name + "</h3>\
                    <table>\
                        <tr>\
                            <th></th>\
                            <th colspan='2'><a href='#'>Подсчёт ЦИК</a></th>\
                        </tr>" + ttContent + "\
                    </table>\
                </div><span class='arrow'></span></div>"
            );
        }
        
        api.show();
}

function hideTooltip() {
    api.hide();
}

//Bread-crumbs
function putBreadCrumbs(f){
    var delimiter = ' - ';
    if (NGe.currentLevel == 2){
        document.getElementById('bc2').innerHTML = '';
        document.getElementById('bc3').innerHTML = '';
    }
    if (NGe.currentLevel == 3){
        document.getElementById('bc3').innerHTML = '';
        document.getElementById('bc2').innerHTML = delimiter + f.attributes.unit.name;
    }
    if (NGe.currentLevel == 4){
        document.getElementById('bc3').innerHTML = delimiter + f.attributes.unit.name;
    }
}

function panIntoView(tt) {

    var mapWidth  = $('#map').width(),
        mapHeight = $('#map').height(),
        tooltipWidth  = tt.width(),
        tooltipHeight = tt.height(),
        tooltipLeft = tt.position().left,
        tooltipTop = tt.position().top,
        mapLeft = $('#map').position().left,
        mapTop = $('#map').position().top,
        paddingForTooltip = new OpenLayers.Bounds(10, 10, 10, 10),
        origTL = new OpenLayers.Pixel(parseInt(tooltipLeft, 10), parseInt(tooltipTop, 10)),
        newTL = origTL.clone(),
        dx,
        dy;
    
    //Сдвиг по горизонтали
    if (origTL.x < mapLeft + paddingForTooltip.left) {
        newTL.x = mapLeft + paddingForTooltip.left;
    } else if ((origTL.x + tooltipWidth) > (mapLeft + mapWidth - paddingForTooltip.right)) {
        newTL.x = mapLeft + mapWidth - tooltipWidth - paddingForTooltip.right;
    }

    //Сдвиг по вертикали
    if (origTL.y < mapTop + paddingForTooltip.top) {
        newTL.y = mapTop + paddingForTooltip.top;
    } else if ((origTL.y + tooltipHeight) > (mapTop + mapHeight - paddingForTooltip.bottom)) {
        newTL.y = mapTop + mapHeight - tooltipHeight - paddingForTooltip.bottom;
    }

    dx = origTL.x - newTL.x;
    dy = origTL.y - newTL.y;

    tt.animate({'marginLeft' : -dx, 'marginTop': -dy});
    map.pan(dx, dy);

}


function showttForMouse(e) {
    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
        trigger = api.getTrigger();
        $('.tooltip').css({ 'left': (x - 210) + 'px', 'top': (y - 275) + 'px'});
    }
}

$(document).ready(function() {
    
    $('#mapcont .menu li').click(function() {
        $(this).parent().children('li').removeClass('sel');
        $(this).addClass('sel');
        $(this).children('input').change();
    });

    $('body').bind('mousemove', showttForMouse);

});
