(function (wp) {
    'use strict';
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var definitions = {
        'destination-atlas': ['Destination atlas', 'location-alt', 'Your published destinations appear here. Edit their names, photos, descriptions, countries and coordinates in Dashboard → Destinations.'],
        'packing-checklist': ['Packing checklist', 'clipboard', 'An interactive checklist with city, beach and outdoors lists. Visitors can save their ticks on this device and download a copy.'],
        'travel-safety': ['Country safety check', 'shield', 'A destination selector linking visitors to official Smartraveller advice.'],
        'travel-entry': ['Visas & entry fees', 'admin-site-alt3', 'A destination selector linking visitors to official entry resources.'],
        'country-posts': ['Country journal posts', 'admin-post', 'Published stories for the country archive, or the country slug you choose below.'],
        'recent-posts': ['Recent adventures', 'admin-post', 'The latest published stories, including Coming soon previews. Edit stories in Dashboard → Posts.']
    };
    wp.blocks.registerBlockType('wei/country-cover', {
        apiVersion: 3, title: 'Country postcard cover', icon: 'format-image', category: 'widgets', supports: { html: false, align: ['wide', 'full'] },
        edit: function () { return el('div', wp.blockEditor.useBlockProps({ className: 'wei-editor-block' }), el('strong', null, 'Country postcard cover'), el('p', null, 'Shows the first destination photograph for the country being viewed. Change it in Dashboard → Destinations → Featured image.')); },
        save: function () { return null; }
    });
    Object.keys(definitions).forEach(function (name) {
        var definition = definitions[name];
        var isPosts = /posts$/.test(name);
        wp.blocks.registerBlockType('wei/' + name, {
            apiVersion: 3,
            title: definition[0],
            icon: definition[1],
            category: 'widgets',
            description: definition[2],
            attributes: isPosts ? { count: { type: 'number', default: name === 'recent-posts' ? 3 : 12 }, country: { type: 'string', default: '' } } : { title: { type: 'string', default: '' }, description: { type: 'string', default: '' } },
            supports: { html: false, align: ['wide', 'full'] },
            edit: function (props) {
                var fields = isPosts ? [
                    el(wp.components.RangeControl, { key: 'count', label: 'Number of stories', min: 1, max: 48, value: props.attributes.count, onChange: function (value) { props.setAttributes({ count: value }); } }),
                    el(wp.components.TextControl, { key: 'country', label: 'Country slug (optional)', help: name === 'country-posts' ? 'Leave empty to follow the current country archive. Example: indonesia.' : 'Leave empty to show all countries.', value: props.attributes.country, onChange: function (value) { props.setAttributes({ country: value }); } })
                ] : [
                    el(wp.components.TextControl, { key: 'title', label: name === 'destination-atlas' ? 'Postcard collection heading' : 'Heading', help: 'Leave empty to use the original wording.', value: props.attributes.title, onChange: function (value) { props.setAttributes({ title: value }); } }),
                    el(wp.components.TextareaControl, { key: 'description', label: name === 'destination-atlas' ? 'Collection note' : 'Introduction', value: props.attributes.description, onChange: function (value) { props.setAttributes({ description: value }); } })
                ];
                var ServerSideRender = wp.serverSideRender.default || wp.serverSideRender;
                return el(Fragment, null,
                    el(wp.blockEditor.InspectorControls, null, el(wp.components.PanelBody, { title: definition[0], initialOpen: true }, fields)),
                    el('div', wp.blockEditor.useBlockProps({ className: 'wei-editor-block' }),
                        el('div', { className: 'wei-editor-block-label' }, el('strong', null, definition[0]), el('p', null, definition[2])),
                        el(ServerSideRender, { block: 'wei/' + name, attributes: props.attributes, httpMethod: 'POST' })
                    )
                );
            },
            save: function () { return null; }
        });
    });
})(window.wp);
