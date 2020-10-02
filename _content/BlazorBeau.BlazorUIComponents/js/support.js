/* Provides all of the necessary supporting JS functions for interop within components */

// Check if the observer API is supported
let observerApiSupported = ('IntersectionObserver' in window) ? true : false;

let observables = new WeakMap();

let windowLoaded = false;

let options = {
    rootMargin: '0px'
}

let callback = (entries, observer) => {
    entries.forEach(entry => {

        let element = entry.target;

        if (entry.isIntersecting && observables.has(element)) {
            
            let dotNetObj = observables.get(element);
            dotNetObj.invokeMethodAsync('SetInView');
            observer.unobserve(element);
            observables.delete(element);
        }
    });
};

let observer = observerApiSupported ? new IntersectionObserver(callback, options) : null;

window.observeElement = function (element, dotNetObj) {

    if (observerApiSupported) { // set the element in weakmap to reference the DotNetComponent
        
        observables.set(element, dotNetObj);
        observer.observe(element);
    }
    else { // if intersectionObserver not supported then perform action immediately
        dotNetObj.invokeMethodAsync('SetInView');
    }
}


let navObserverCallback = (entries, observer) => {

    for (i = 0; i < entries.length; i++) {
        let entry = entries[i];
        let element = entry.target;
        let elementRect = element.getBoundingClientRect();
        let viewportHeight = getViewPortDimensions().InnerHeight;
        if (entry.isIntersecting && (elementRect.bottom > (viewportHeight * 0.5) && elementRect.top < (viewportHeight * 0.5))) {
            observer.dotNetObj.invokeMethodAsync('SetSectionInView', '#' + element.id);

            // no need to continue from here on with this set of entries, so we break
            break;
        }
    } 
}

let navObserverOptions = null;
let navSectionObserver = null;

window.navBarResponsiveObserverInit = function (links, dotNetObj) {

    if (observerApiSupported) { // if Observer API not supported then forget it
        navObserverOptions = {
            rootMargin: '0%',
            threshold: generateThresholdArray(5)
        }
        navSectionObserver = observerApiSupported ? new IntersectionObserver(navObserverCallback, navObserverOptions) : null;
        navSectionObserver.dotNetObj = dotNetObj;

        links.forEach((link) => {

            let section = this.document.getElementById(link.href.replace('#', ''));
            if (section) {
                navSectionObserver.observe(section);
            }
        });
    }
   
}

window.generateThresholdArray = (steps) => {
    let thresholds = [];
    let factor = 1.00 / steps;
    for (i = 1; i <= steps; i++) {
        thresholds.push(i * factor);
    }
    return thresholds;
}

window.scrollSectionIntoView = (id) => {
    document.getElementById(id).scrollIntoView();
}

window.getViewPortDimensions = function () {
    
    if (!window.innerHeight || !window.innerWidth) {
        return null;
    }

    let viewPortDim = { InnerHeight: window.innerHeight, InnerWidth: window.innerWidth };
    return viewPortDim;
}