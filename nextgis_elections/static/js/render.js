

NGe.setRenderer = function (renderer, args) {
    if (renderer == undefined) { renderer = 'partyVote'; };
    if (args == undefined) { args = {party_id: 5}; };

    for (var i in NGe.tlayer) {
        if (i < 4) {
        NGe.setLayerRenderer(NGe.tlayer[i], renderer, args);
        };
    };

    NGe.currentRenderer = renderer;
    NGe.currentRendererArgs = args;
};

NGe.setLayerRenderer = function (layer, renderer, args) {
    NGe.render[renderer](layer, args);
    layer.redraw();  
};

NGe.render = {};

NGe.render.partyVote = function (layer, args) {
    var items = [];
    var color_x  = NGe.parties[args.party_id].pal;

    for (var i = 0; i < layer.features.length; i += 1) {
        items.push(layer.features[i].attributes.protocol_o.vote_p[args.party_id]);
    }

    if (items.length == 0) {return;};
    
    var series = new geostats(items);
    var a = series.getQuantile(color_x.length-2);
    var ranges = series.ranges;
    var class_x = ranges;

    series.setColors(color_x);

    getClass = function (val, a) {
        for (var i = 0; i < a.length; i += 1) {
            var item = a[i].split(/ - /);
            if (val <= parseFloat(item[1])) {
                return i;
            }
        }
    };
    
    var context_x = {
        getColor: function(feature) {
            color = color_x;
            return color[getClass(feature.attributes.protocol_o.vote_p[args.party_id], class_x)];
        }
    };

    var template = {
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWidth: 1,
        strokeOpacity: 0.5,
        fillColor: "${getColor}"
    };

    var style_x = new OpenLayers.Style(template, {context: context_x});
    var styleMap_x = new OpenLayers.StyleMap({'default': style_x});
    
    layer.styleMap = styleMap_x;
};
