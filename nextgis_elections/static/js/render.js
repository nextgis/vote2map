NGe.setRenderer = function (renderer, args) {
    if (renderer == undefined) { renderer = 'presence'; };
    if (args == undefined) { args = {}; };

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

NGe.colorGradientSteps = function (start, finish, steps) {
    var splitColor = function (c) {
        var r = []
        for (var i=1; i < 6; i = i+2) {
            r.push(parseInt(c.substr(i, 2), 16));
        };
        return r
    };

    var s_s = splitColor(start);
    var s_f = splitColor(finish);

    series = [];
    for (var i=0; i<steps; i++) {
        r = '#';
        for (var j=0; j<3; j++) {
            v = Math.round((1.0 * s_s[j] * (steps - i - 1) / (steps - 1) + 1.0 * s_f[j] * (i) / (steps-1))).toString(16);
            if (v.length == 1) { v = '0' + v; };
            r = r + v;
        };
        series.push(r);
    };

    return series;
};

NGe.render = {};

NGe.render.partyVote = function (layer, args) {
    var items = [];

    for (var i = 0; i < layer.features.length; i += 1) {
        items.push(layer.features[i].attributes.protocol_o.vote_p[args.party_id]);
    };

    if (items.length == 0) {return;};
    
    var series = new geostats(items);
    var a = series.getQuantile(8);
    var ranges = series.ranges;
    var class_x = ranges;

    var colors = NGe.colorGradientSteps(NGe.parties[args.party_id].color, '#eeeeee', series.ranges.length);

    series.setColors(colors);

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
            return colors[getClass(feature.attributes.protocol_o.vote_p[args.party_id], class_x)];
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

NGe.render.presence = function (layer, args) {
    var items = [];
    var color_x  = ['#e2dee6', '#c2abdd', '#9d87b6', '#735a8f', '#3d2e4e'];

    fvalue = function(f) {
        return (f.attributes.protocol_o.b_valid + f.attributes.protocol_o.b_invalid) / f.attributes.protocol_o.b_count;
    };


    for (var fid in layer.features) {
        items.push(fvalue(layer.features[fid]));
    };

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
            return color[getClass(fvalue(feature), class_x)];
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