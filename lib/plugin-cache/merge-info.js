'use strict';

function cleanupDescription(str) {
    if (!str) {
        return str;
    }

    str = str.trim()
        .replace(/:\w+:/, '') // remove GitHub emojis
        .replace(/ ?plugin for (?:pixi(?:\.?js)?) ?/i, '')
        .replace(/(?:a )?(?:pixi(?:\.js)?) (?:plugin (?:for|to|that|which)?)?/i, '')
        .replace(/(?:pixi(?:\.js)?) plugin$/i, '')
        .replace(/ ?application ?/i, 'app')
        .trim()
        .replace(/\.$/, '');

    str = str.charAt(0).toUpperCase() + str.slice(1);

    return str;
}

module.exports = function (npm, gh) {
    gh = gh || {};

    var description;
    if (npm.description && gh.description) {
        if (npm.description.length > gh.description.length) {
            description = npm.description;
        }
        else {
            description = gh.description;
        }
    }
    else {
        description = npm.description || gh.description;
    }

    var ownerWebsite = npm.author && npm.author.url;
    ownerWebsite = ownerWebsite || gh.owner && gh.owner.html_url;

    return {
        name: npm.name.replace(/^pixi-/, ''),
        description: cleanupDescription(description || ''),
        stars: gh.stargazers_count || 0,
        downloads: npm.downloads,
        site: npm.website || gh.html_url || '',
        owner: {
            name: npm.author && npm.author.name || gh.owner && gh.owner.login || '',
            site: ownerWebsite || ''
        },
        updated: npm.updated
    };
};