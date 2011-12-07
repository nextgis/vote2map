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
        console.log('existing layer' + layer.name)
        layer.setVisibility(true);
        layer.refresh({'url': url});
    };

    // остальные выключаем
    for (var l in NGe.tlayer) {
        if (l != level) { NGe.tlayer[l].setVisibility(false); };
    };


    NGe.currentLevel = level;
    NGe.currentRoot = root;

};

var map;



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
        //resolutions: [360, 180, 90, 45],
        //controls: [new OpenLayers.Control.LayerSwitcher()],
        maxExtent: new OpenLayers.Bounds(4133471.04,7457808.76,4226219.99,7562641.88),
        restrictedExtent: new OpenLayers.Bounds(4133471.04,7457808.76,4226219.99,7562641.88),
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
            selectStyle: {fillColor: '#ffcc99', fillOpacity: 0.5, strokeWidth: 1, strokeColor: '#ffa500'},
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
                NGe.setLevel(f.attributes.unit.level+1, f.attributes.unit.id);
                map.zoomToExtent(f.geometry.getBounds());

            }
        }
    );

    map.addControls([NGe.cntrlHover, NGe.cntrlSelect]);


    map.zoomToExtent(new OpenLayers.Bounds(4108911.9527615,7430730.8105945,4261786.0093105,7583604.8671435));
    NGe.setLevel(2);

}


function showTooltip(f) {
    var trigger = api.getTrigger(),
        coords = f.layer.map.getPixelFromLonLat(f.geometry.getBounds().getCenterLonLat()),
        tX = coords.x,
        tY = coords.y;
        trigger.css({'left': tX + 'px', 'top': tY + 'px'});
        api.getConf().tip.html("<table><tr><td>ЕдРо</td></tr><tr><td>" + f.attributes.protocol_o.vote_c["6"] + "</td></tr></table>");
        api.show();
}

function hideTooltip() {
    api.hide();
}
