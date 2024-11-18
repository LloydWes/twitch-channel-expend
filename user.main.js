// ==UserScript==
// @name         Twitch - Expand your followed channels list automatically
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Expand your followed channels list automatically and keep expending it as new channels go online
// @author       Lloyd WESTBURY
// @match        https://www.twitch.tv/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @license      MIT
// @run-at document-idle
// @grant        none
// @homepageURL  https://https://github.com/LloydWes/twitch-channel-expend
// @license      MIT
// ==/UserScript==

(function () {

    'use strict';

    // Wait for the DOM to load
    function waitForElement(querySelector) {
        return new Promise((resolve, reject) => {
            if (document.querySelectorAll(querySelector).length) resolve();
            const observer = new MutationObserver(() => {
                if (document.querySelectorAll(querySelector).length) {
                    observer.disconnect();
                    return resolve();
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    let expendUntilOfflineChannelFound = (resolve, fail) => {
        let expandBtn = document.querySelector(".side-nav-show-more-toggle__button > button");
        if (!document.querySelectorAll(".side-nav-card__avatar--offline").length && expandBtn) {
            expandBtn.click();
            return resolve();
        } else {
            return fail();
        }
    }
    let getExpendingPromise = () => {
        return new Promise((resolve, reject) => {
            return expendUntilOfflineChannelFound(resolve, reject)
        })}
    let launchPromiseChaine = () => {
        getExpendingPromise().then(() => {
            setTimeout(launchPromiseChaine, 200);
        }).catch(()=>{
            setAutoExpend();
        });
    }

    function setAutoExpend() {
        const sideBar = document.getElementsByClassName("side-bar-contents")[0];
        let followedSection = sideBar.getElementsByClassName("side-nav-section")[0];

        const config = { attributes: false, childList: true, subtree: true };
        const callback = (mutationList, obs) => {
            let relevantMutation = false;
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    relevantMutation = true;
                    break;
                }
            }
            if (relevantMutation) {
                let fv = followedSection.querySelectorAll('div[class*=offline]');
                if (fv.length === 0) {
                    obs.disconnect();
                    launchPromiseChaine();
                }
            }
        };
        const observer = new MutationObserver(callback);

        observer.observe(sideBar, config);
    }

    // Initialize
    waitForElement(".side-nav-show-more-toggle__button").then(() => {
        setTimeout(launchPromiseChaine, 1000);
    });
}());
