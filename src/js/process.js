// --- src/js/process.js ---

export function initProcess() {
  // 1. SCROLL-LINKED PINNED TIMELINE (Homepage)
  const pinTrack = document.getElementById('processPinTrack');
  const timeline = document.getElementById('processTimeline');
  const tProgress = document.getElementById('tProgress');
  const tSteps = document.querySelectorAll('.t-step');

  if (timeline && tProgress && tSteps.length > 0 && !timeline.dataset.scrollTimelineBound) {
    timeline.dataset.scrollTimelineBound = 'true';

    let isHovering = false;
    let hoveredStepNum = null;
    let currentScrollProgress = 0;
    let lastActiveStepNum = 1;

    // Step Activation Thresholds (0%, 25%, 50%, 75%, 100%)
    const thresholds = [0, 0.22, 0.47, 0.72, 0.95];

    function applyTimelineState(activeNum, percentage) {
      const isMobile = window.innerWidth <= 900;
      const clampedPct = Math.max(0, Math.min(100, percentage));

      // 1. Progress line dimension
      if (isMobile) {
        tProgress.style.width = '2px';
        tProgress.style.height = `${clampedPct}%`;
      } else {
        tProgress.style.height = '2px';
        tProgress.style.width = `${clampedPct}%`;
      }

      // 2. Step classes
      tSteps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'), 10);
        const wasActive = step.classList.contains('active');
        const nowActive = stepNum <= activeNum;

        // Pop animation on newly activated node
        if (!wasActive && nowActive) {
          step.classList.add('just-activated');
          setTimeout(() => step.classList.remove('just-activated'), 550);
        }

        step.classList.toggle('active', nowActive);
      });

      lastActiveStepNum = activeNum;
    }

    function calculateScrollProgress() {
      if (isHovering) return;

      const isMobile = window.innerWidth <= 900;

      if (!isMobile && pinTrack) {
        // Desktop: Scroll through the pinned track
        const rect = pinTrack.getBoundingClientRect();
        const scrollableDistance = rect.height - window.innerHeight;

        if (scrollableDistance > 0) {
          const scrolled = -rect.top;
          const rawRatio = scrolled / scrollableDistance;
          currentScrollProgress = Math.max(0, Math.min(1, rawRatio));
        } else {
          currentScrollProgress = 0;
        }

        let activeStep = 1;
        thresholds.forEach((thresh, idx) => {
          if (currentScrollProgress >= thresh) {
            activeStep = idx + 1;
          }
        });

        applyTimelineState(activeStep, currentScrollProgress * 100);

      } else {
        // Mobile / Small screens: Vertical scroll position
        const rect = timeline.getBoundingClientRect();
        const viewportCenter = window.innerHeight * 0.55;

        let activeIdx = 0;
        tSteps.forEach((step, idx) => {
          const sRect = step.getBoundingClientRect();
          if (sRect.top <= viewportCenter) {
            activeIdx = idx;
          }
        });

        const activeStep = activeIdx + 1;
        const pct = (activeIdx / (tSteps.length - 1)) * 100;
        applyTimelineState(activeStep, pct);
      }
    }

    // Interactive Hover & Click preview
    tSteps.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'), 10);

      step.addEventListener('mouseenter', () => {
        isHovering = true;
        hoveredStepNum = stepNum;
        const previewPct = ((stepNum - 1) / (tSteps.length - 1)) * 100;
        applyTimelineState(stepNum, previewPct);
      });

      step.addEventListener('click', () => {
        const previewPct = ((stepNum - 1) / (tSteps.length - 1)) * 100;
        applyTimelineState(stepNum, previewPct);
      });
    });

    timeline.addEventListener('mouseleave', () => {
      isHovering = false;
      hoveredStepNum = null;
      calculateScrollProgress();
    });

    // Throttled scroll listener
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calculateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Handle viewport resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateScrollProgress();
      }, 100);
    }, { passive: true });

    // Initial calculation on render
    calculateScrollProgress();
  }

  // 2. EDITORIAL SCROLL - IMAGE SWAPPING (The MITRA Experience)
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

  // BEFORE/AFTER COMPARISON SLIDER WITH SPRING PHYSICS & BLUR ZONE
  const container = document.getElementById("comparison");
  if (container && !container.dataset.comparisonBound) {
    container.dataset.comparisonBound = 'true';
    const beforeImage = container.querySelector(".image-before");
    const sliderLine = document.getElementById("sliderLine");
    const sliderKnob = document.getElementById("sliderKnob");
    const sliderBlurZone = document.getElementById("sliderBlurZone");
    const labelBefore = container.querySelector(".label-before");
    const labelAfter = container.querySelector(".label-after");

    let isDragging = false;
    let currentPosition = 50; // Percentage
    let animationFrameId = null;
    let targetPosition = 50;
    let springAnimId = null;
    let springVelocity = 0;

    function updateLabels(clamped) {
      // Dynamic Edge Fading: When dragging near edges, labels smoothly glow and scale
      if (labelBefore) {
        if (clamped >= 68) {
          const factor = (clamped - 68) / 32;
          labelBefore.style.opacity = (0.7 + 0.3 * factor).toFixed(2);
          labelBefore.style.transform = `scale(${(1 + 0.06 * factor).toFixed(3)}) translateY(0)`;
        } else if (clamped <= 25) {
          labelBefore.style.opacity = Math.max(0.15, (clamped / 25) * 0.45).toFixed(2);
          labelBefore.style.transform = 'scale(0.96) translateY(0)';
        } else {
          labelBefore.style.opacity = '0.65';
          labelBefore.style.transform = 'scale(1) translateY(0)';
        }
      }

      if (labelAfter) {
        if (clamped <= 32) {
          const factor = (32 - clamped) / 32;
          labelAfter.style.opacity = (0.7 + 0.3 * factor).toFixed(2);
          labelAfter.style.transform = `scale(${(1 + 0.06 * factor).toFixed(3)}) translateY(0)`;
        } else if (clamped >= 75) {
          labelAfter.style.opacity = Math.max(0.15, ((100 - clamped) / 25) * 0.45).toFixed(2);
          labelAfter.style.transform = 'scale(0.96) translateY(0)';
        } else {
          labelAfter.style.opacity = '0.65';
          labelAfter.style.transform = 'scale(1) translateY(0)';
        }
      }
    }

    function updateSlider(position) {
      if (typeof position === 'number') {
        targetPosition = position;
      }
      
      const clamped = Math.max(0, Math.min(100, targetPosition));
      currentPosition = clamped;

      // 1. Clip path for before image
      if (beforeImage) {
        beforeImage.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      }

      // 2. Optical blur transition zone & divider line
      if (sliderBlurZone) {
        sliderBlurZone.style.left = `${clamped}%`;
      }
      if (sliderLine) {
        sliderLine.style.left = `${clamped}%`;
      }

      // 3. Knob position & ARIA
      if (sliderKnob) {
        sliderKnob.style.left = `${clamped}%`;
        sliderKnob.setAttribute("aria-valuenow", Math.round(clamped));
      }

      // 4. Subtle edge label fading
      updateLabels(clamped);

      animationFrameId = null;
    }

    function runSpringPhysics(snapTarget) {
      if (springAnimId) cancelAnimationFrame(springAnimId);
      const stiffness = 0.12; // Spring tension
      const damping = 0.72;   // Spring resistance

      function springStep() {
        const force = (snapTarget - currentPosition) * stiffness;
        springVelocity = (springVelocity + force) * damping;
        currentPosition += springVelocity;
        
        updateSlider(currentPosition);

        if (Math.abs(springVelocity) > 0.04 || Math.abs(snapTarget - currentPosition) > 0.08) {
          springAnimId = requestAnimationFrame(springStep);
        } else {
          currentPosition = snapTarget;
          updateSlider(currentPosition);
          springAnimId = null;
          springVelocity = 0;
        }
      }

      springAnimId = requestAnimationFrame(springStep);
    }

    function handleStart(clientX) {
      if (springAnimId) {
        cancelAnimationFrame(springAnimId);
        springAnimId = null;
        springVelocity = 0;
      }
      isDragging = true;
      container.classList.add("dragging");
      handleMove(clientX);
    }

    function handleMove(clientX) {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;
      const x = clientX - rect.left;
      targetPosition = (x / rect.width) * 100;

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => updateSlider());
      }
    }

    function handleRelease() {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove("dragging");

      // Snap Physics:
      // If released in central exploration zone (20% - 80%), snap to 50%
      // If released near extremes (< 15% or > 85%), snap to 0% or 100%
      let snapTarget = 50;
      if (currentPosition < 15) {
        snapTarget = 0;
      } else if (currentPosition > 85) {
        snapTarget = 100;
      } else {
        snapTarget = 50;
      }

      runSpringPhysics(snapTarget);
    }

    // Mouse Listeners
    if (sliderKnob) {
      sliderKnob.addEventListener("mousedown", (e) => {
        e.preventDefault();
        handleStart(e.clientX);
      });
    }

    container.addEventListener("mousedown", (e) => {
      if (sliderKnob && e.target === sliderKnob) return;
      handleStart(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    });

    window.addEventListener("mouseup", handleRelease);

    // Touch Listeners
    if (sliderKnob) {
      sliderKnob.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          if (e.touches && e.touches[0]) handleStart(e.touches[0].clientX);
        },
        { passive: false }
      );
    }

    container.addEventListener(
      "touchstart",
      (e) => {
        if (sliderKnob && e.target === sliderKnob) return;
        if (e.touches && e.touches[0]) handleStart(e.touches[0].clientX);
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
      },
      { passive: true }
    );

    window.addEventListener("touchend", handleRelease);

    // Keyboard accessibility
    if (sliderKnob) {
      sliderKnob.setAttribute("tabindex", "0");
      sliderKnob.setAttribute("role", "slider");
      sliderKnob.setAttribute("aria-label", "Image comparison slider");
      sliderKnob.setAttribute("aria-valuemin", "0");
      sliderKnob.setAttribute("aria-valuemax", "100");
      sliderKnob.setAttribute("aria-valuenow", "50");

      sliderKnob.addEventListener("keydown", (e) => {
        if (springAnimId) {
          cancelAnimationFrame(springAnimId);
          springAnimId = null;
        }

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
