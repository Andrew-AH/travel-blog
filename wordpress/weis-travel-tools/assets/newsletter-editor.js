(function (blocks, element, editor, components) {
  'use strict';
  const el = element.createElement;
  const Fragment = element.Fragment;
  const defaults = {
    heading: { type: 'string', default: 'Let’s explore the world' },
    description: { type: 'string', default: 'New tips, stories, and guides delivered to your inbox.' },
    buttonLabel: { type: 'string', default: 'Join the journey' },
  };

  blocks.registerBlockType('wei/newsletter-signup', {
    apiVersion: 3, title: 'Newsletter signup', icon: 'email', category: 'widgets',
    description: 'Collect newsletter signups with consent. Manage subscribers under Tools → Newsletter.',
    attributes: { buttonLabel: defaults.buttonLabel }, supports: { html: false },
    edit: function (props) {
      return el('div', editor.useBlockProps({ className: 'wei-newsletter-editor-preview' }),
        el('strong', null, 'Letters from Wei — signup form'),
        el('p', null, 'First name · Email address · Newsletter consent'),
        el(components.TextControl, { label: 'Signup button text', value: props.attributes.buttonLabel, onChange: value => props.setAttributes({ buttonLabel: value }) }),
        el('p', null, 'The working form appears on the website. Subscribers are saved privately in WordPress; this does not send email.')
      );
    },
    save: function () { return null; },
  });

  blocks.registerBlockType('wei/newsletter-unsubscribe', {
    apiVersion: 3, title: 'Newsletter unsubscribe', icon: 'email-alt', category: 'widgets',
    description: 'An unsubscribe confirmation for private links from subscriber exports.',
    supports: { html: false },
    edit: function () {
      return el('div', editor.useBlockProps({ className: 'wei-newsletter-editor-preview' }),
        el('strong', null, 'Newsletter unsubscribe confirmation'),
        el('p', null, 'Readers arriving with a private unsubscribe link can confirm their preference. Opening a link alone never unsubscribes anyone.')
      );
    },
    save: function () { return null; },
  });

  blocks.registerBlockType('wei/newsletter-teaser', {
    apiVersion: 3, title: 'Newsletter invitation', icon: 'email', category: 'widgets',
    description: 'The newsletter footer. Email drafts continue privately to the signup page.',
    attributes: defaults, supports: { html: false },
    edit: function (props) {
      return el(Fragment, null,
        el(editor.InspectorControls, null, el(components.PanelBody, { title: 'Newsletter invitation' },
          el(components.TextControl, { label: 'Button text', value: props.attributes.buttonLabel, onChange: value => props.setAttributes({ buttonLabel: value }) })
        )),
        el('div', editor.useBlockProps({ className: 'wei-newsletter-editor-preview' }),
          el(editor.RichText, { tagName: 'h2', value: props.attributes.heading, allowedFormats: [], onChange: value => props.setAttributes({ heading: value }), placeholder: 'Newsletter heading' }),
          el(editor.RichText, { tagName: 'p', value: props.attributes.description, allowedFormats: [], onChange: value => props.setAttributes({ description: value }), placeholder: 'Newsletter description' }),
          el('p', null, 'Email address → ' + props.attributes.buttonLabel)
        )
      );
    },
    save: function () { return null; },
  });
})(window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components);
