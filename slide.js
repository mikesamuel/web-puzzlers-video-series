// Fade in/out transitions between slide elements
// based on classes like
//     <span class="for:1-3,7">
// which specifies the content is visible for steps 1,2,3, and 7.
//
// For step 4, the <body> element will have class="step-4".
//
// Left and right arrows go to previous/next step.
// Up and down go to first, last step.

(function () {
  let elementsPerStep = []
  {
    let elRanges = [];
    let maxStep = 0;
    for (let element of document.querySelectorAll('*[class*="for:"]')) {
      let hasRange = false;
      for (let className of element.className.split(/\s+/g)) {
        let ranges = /^for:([\d,\-]+)$/.exec(className);
        if (ranges) {
          for (let range of ranges[1].split(',')) {
            let match = /^(\d+)(?:-(\d*))?$/.exec(range);
            if (match) {
              let min = +match[1];
              let max = +(match[2] || min);
              let openAtEnd = match[2] === '';
              maxStep = Math.max(max, maxStep);
              elRanges.push({ element, min, max, openAtEnd });
              hasRange = true;
            }
          }
        }
      }
      if (hasRange) {
        element.style.opacity = 0;
        element.style.display = 'none';
      }
    }
    for (let i = 0; i <= maxStep; ++i) {
      elementsPerStep[i] = new Set;
    }
    for (let { element, min, max, openAtEnd } of elRanges) {
      for (let i = min, n = openAtEnd ? maxStep : max; i <= n; ++i) {
        elementsPerStep[i].add(element);
      }
    }
  }

  document.onkeydown = (e) => {
    switch (e.keyCode) {
    case 37:  // left
      toStep(Math.max(0, step - 1));
      break;
    case 38:  // up
      toStep(0);
      break;
    case 39:  // right
      toStep(Math.min(step + 1, Math.max(0, elementsPerStep.length - 1)));
      break;
    case 40:  // down
      toStep(Math.max(0, elementsPerStep.length - 1));
      break;
    }
  }

  function toStep(newStep) {
    newStep = newStep | 0;
    if (step === newStep
        || !(0 <= newStep && newStep < elementsPerStep.length)) {
      return;
    }

    let visible = elementsPerStep[step] || new Set();
    let newVisible = elementsPerStep[newStep];
    for (let el of visible) {
      if (!newVisible.has(el)) {
        fade(el, 1.0, 0.0);
      }
    }
    for (let el of newVisible) {
      if (!visible.has(el)) {
        fade(el, 0.0, 1.0);
      }
    }

    step = newStep;
    document.body.className =
      document.body.className.replace(/\bstep-\d+\b|^ +/g, '')
      + ' step-' + newStep;
    location.hash = '#' + step;
  }

  let transitioning = new Map();

  function fade(element, startOpacity, targetOpacity) {
    let step = /\brapid\b/.test(element.className) ? 1.0 : 0.0625;
    let record = transitioning.get(element);
    if (!record) {
      record = { element: element, opacity: startOpacity, step };
      transitioning.set(element, record);
    }
    record.targetOpacity = targetOpacity;
  }

  let step = -1;
  toStep(+(location.hash.replace(/^#/, '')) || 0);

  setInterval(
    () => {
      let defunct = [];
      for (let record of transitioning.values()) {
        let { element, opacity, targetOpacity, step } = record;
        let newOpacity;
        if (opacity < targetOpacity) {
          newOpacity = Math.min(opacity + step, targetOpacity);
        } else if (opacity > targetOpacity) {
          newOpacity = Math.max(opacity - step, targetOpacity);
        } else {
          defunct.push(element);
          continue;
        }
        element.style.opacity = record.opacity = newOpacity;
        element.style.display = newOpacity ? '' : 'none';
        if (opacity === newOpacity) {
          defunct.add(element);
        }
      }
      for (let element of defunct) {
        transitioning.delete(element);
      }
    },
    50 /* ms */);
}());
