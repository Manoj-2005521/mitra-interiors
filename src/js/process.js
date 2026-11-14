// --- src/js/process.js ---

export function initProcess() {
  // INTERACTIVE PROCESS TIMELINE
  const timeline = document.getElementById('processTimeline');
  const tProgress = document.getElementById('tProgress');
  const tSteps = document.querySelectorAll('.t-step');

  if (timeline && tProgress && tSteps.length > 0 && !timeline.dataset.timelineBound) {
    timeline.dataset.timelineBound = 'true';
    updateTimeline(1);

    tSteps.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'), 10);
      
      step.addEventListener('mouseenter', () => {
        updateTimeline(stepNum);
      });
      
      step.addEventListener('click', () => {
        updateTimeline(stepNum);
        timeline.setAttribute('data-locked-step', stepNum);
      });
    });

    timeline.addEventListener('mouseleave', () => {
      const lockedStep = parseInt(timeline.getAttribute('data-locked-step'), 10) || 1;
      updateTimeline(lockedStep);
    });

    function updateTimeline(activeStepNum) {
      tSteps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'), 10);
        step.classList.toggle('active', stepNum <= activeStepNum);
      });

      const totalSteps = tSteps.length;
      const percentage = ((activeStepNum - 1) / (totalSteps - 1)) * 100;

      const isMobile = window.innerWidth <= 900;
      if (isMobile) {
        tProgress.style.width = '2px';
        tProgress.style.height = `${percentage}%`;
      } else {
        tProgress.style.height = '2px';
        tProgress.style.width = `${percentage}%`;
      }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const activeStepNum = parseInt(timeline.querySelector('.t-step.active:last-of-type')?.getAttribute('data-step'), 10) || 1;
        updateTimeline(activeStepNum);
      }, 100);
    }, { passive: true });
  }

  // EDITORIAL SCROLL - IMAGE SWAPPING (The MITRA Experience)
  const phaseBlocks = document.querySelectorAll('.phase-block');
  const stickyImages = document.querySelectorAll('.exp-visuals img');
  const timelineNodes = document.querySelectorAll('.timeline-node');

  if (phaseBlocks.length > 0 && stickyImages.length > 0) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const phaseIndex = parseInt(entry.target.getAttribute('data-phase'), 10) - 1;
          
          // Update Images & Parent Picture tags
          const stickyPictures = document.querySelectorAll('.exp-visuals picture');
          stickyImages.forEach((img, idx) => {
            img.classList.toggle('active', idx === phaseIndex);
          });
          stickyPictures.forEach((pic, idx) => {
            pic.classList.toggle('active', idx === phaseIndex);
          });
          
          // Update Timeline Nodes
          timelineNodes.forEach((node, idx) => {
            node.classList.toggle('active', idx <= phaseIndex);
          });
        }
      });
    }, { threshold: 0.4 }); // Trigger when 40% of the block is visible

    phaseBlocks.forEach(block => scrollObserver.observe(block));
  }

  // BEFORE/AFTER COMPARISON SLIDER
  const container = document.getElementById("comparison");
  if (container && !container.dataset.comparisonBound) {
    container.dataset.comparisonBound = 'true';
    const beforeImage = container.querySelector(".image-before");
    const sliderLine = document.getElementById("sliderLine");
    const sliderKnob = document.getElementById("sliderKnob");

    let isDragging = false;
    let currentPosition = 50; // Percentage
    let animationFrameId = null;
    let targetPosition = 50;

    function updateSlider(position) {
      if (typeof position === 'number') {
        targetPosition = position;
      }
      
      const clamped = Math.max(0, Math.min(100, targetPosition));
      currentPosition = clamped;

      // Update clip-path for before image (clipping from the right side)
      if (beforeImage) {
        beforeImage.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      }

      // Update slider line and knob position
      if (sliderLine) {
        sliderLine.style.left = `${clamped}%`;
      }
      if (sliderKnob) {
        sliderKnob.style.left = `${clamped}%`;
        sliderKnob.setAttribute("aria-valuenow", Math.round(clamped));
      }

      animationFrameId = null;
    }

    function handleMove(clientX) {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      targetPosition = (x / rect.width) * 100;

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => updateSlider());
      }
    }

    // Mouse events
    if (sliderKnob) {
      sliderKnob.addEventListener("mousedown", (e) => {
        isDragging = true;
        container.classList.add("dragging");
        e.preventDefault();
      });
    }

    container.addEventListener("mousedown", (e) => {
      if (sliderKnob && e.target === sliderKnob) return;
      isDragging = true;
      container.classList.add("dragging");
      handleMove(e.clientX);
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      container.classList.remove("dragging");
    });

    // Touch events
    if (sliderKnob) {
      sliderKnob.addEventListener(
        "touchstart",
        (e) => {
          isDragging = true;
          container.classList.add("dragging");
          e.preventDefault();
        },
        { passive: false },
      );
    }

    container.addEventListener(
      "touchstart",
      (e) => {
        if (sliderKnob && e.target === sliderKnob) return;
        isDragging = true;
        container.classList.add("dragging");
        handleMove(e.touches[0].clientX);
      },
      { passive: false },
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
      },
      { passive: false },
    );

    document.addEventListener("touchend", () => {
      isDragging = false;
      container.classList.remove("dragging");
    });

    // Keyboard accessibility
    if (sliderKnob) {
      sliderKnob.setAttribute("tabindex", "0");
      sliderKnob.setAttribute("role", "slider");
      sliderKnob.setAttribute("aria-label", "Image comparison slider");
      sliderKnob.setAttribute("aria-valuemin", "0");
      sliderKnob.setAttribute("aria-valuemax", "100");
      sliderKnob.setAttribute("aria-valuenow", "50");

      sliderKnob.addEventListener("keydown", (e) => {
        let newPosition = currentPosition;

        switch (e.key) {
          case "ArrowLeft":
          case "ArrowDown":
            newPosition -= 5;
            e.preventDefault();
            break;
          case "ArrowRight":
          case "ArrowUp":
            newPosition += 5;
            e.preventDefault();
            break;
          case "Home":
            newPosition = 0;
            e.preventDefault();
            break;
          case "End":
            newPosition = 100;
            e.preventDefault();
            break;
        }

        updateSlider(newPosition);
      });
    }

    // Initialize
    updateSlider(50);
  }
}
