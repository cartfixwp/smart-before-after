/**
 * Frontend JavaScript for Smart Before After block.
 *
 * Handles:
 * - Slider drag interaction
 * - Hover mode interaction
 * - Horizontal and vertical orientation
 * - Touch support
 * - Keyboard accessibility
 * - Fullscreen/Lightbox mode
 * - Behavior tracking
 * - CTA trigger
 *
 * @package SmartBeforeAfter
 */

( function() {
    'use strict';

    /**
     * Store all slider instances for cleanup.
     */
    const sliderInstances = new WeakMap();

    /**
     * Lightbox singleton instance.
     */
    let lightboxInstance = null;

    /**
     * Lightbox Class for fullscreen viewing.
     */
    class SBALightbox {
        constructor() {
            this.isOpen = false;
            this.isClosing = false;
            this.closeTimeout = null;
            this.currentSlider = null;
            this.lightbox = null;
            this.sliderClone = null;

            // Bind methods
            this.open = this.open.bind( this );
            this.close = this.close.bind( this );
            this.onKeyDown = this.onKeyDown.bind( this );
            this.onBackdropClick = this.onBackdropClick.bind( this );

            this.createLightbox();
        }

        /**
         * Create the lightbox DOM elements.
         */
        createLightbox() {
            // Create lightbox container
            this.lightbox = document.createElement( 'div' );
            this.lightbox.className = 'sba-lightbox';
            this.lightbox.setAttribute( 'role', 'dialog' );
            this.lightbox.setAttribute( 'aria-modal', 'true' );
            this.lightbox.setAttribute( 'aria-label', 'Image comparison fullscreen view' );
            this.lightbox.hidden = true;

            // Create backdrop
            const backdrop = document.createElement( 'div' );
            backdrop.className = 'sba-lightbox__backdrop';
            backdrop.addEventListener( 'click', this.onBackdropClick );

            // Create content wrapper
            this.contentWrapper = document.createElement( 'div' );
            this.contentWrapper.className = 'sba-lightbox__content';

            // Create close button
            const closeBtn = document.createElement( 'button' );
            closeBtn.className = 'sba-lightbox__close';
            closeBtn.type = 'button';
            closeBtn.setAttribute( 'aria-label', 'Close fullscreen' );
            closeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            `;
            closeBtn.addEventListener( 'click', this.close );

            // Assemble
            this.lightbox.appendChild( backdrop );
            this.lightbox.appendChild( this.contentWrapper );
            this.lightbox.appendChild( closeBtn );

            // Add to body
            document.body.appendChild( this.lightbox );
        }

        /**
         * Open lightbox with slider content.
         */
        open( sliderInstance ) {
            if ( this.isOpen || ! sliderInstance ) {
                return;
            }

            // Cancel any pending close animation
            if ( this.isClosing ) {
                clearTimeout( this.closeTimeout );
                this.isClosing = false;
            }

            this.isOpen = true;
            this.currentSlider = sliderInstance;

            // Clone the slider for lightbox
            const originalSlider = sliderInstance.slider;
            this.sliderClone = originalSlider.cloneNode( true );
            this.sliderClone.classList.add( 'sba-lightbox__slider' );

            // Remove fullscreen button from clone
            const fsBtn = this.sliderClone.querySelector( '.sba-fullscreen-btn' );
            if ( fsBtn ) {
                fsBtn.remove();
            }

            // Clear and add clone to content
            this.contentWrapper.innerHTML = '';
            this.contentWrapper.appendChild( this.sliderClone );

            // Show lightbox
            this.lightbox.hidden = false;
            requestAnimationFrame( () => {
                this.lightbox.classList.add( 'sba-lightbox--open' );
            } );

            // Initialize slider functionality on clone
            this.initCloneSlider();

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            // Listen for escape key
            document.addEventListener( 'keydown', this.onKeyDown );

            // Focus close button for accessibility
            const closeBtn = this.lightbox.querySelector( '.sba-lightbox__close' );
            if ( closeBtn ) {
                closeBtn.focus();
            }
        }

        /**
         * Initialize slider functionality on the cloned element.
         */
        initCloneSlider() {
            if ( ! this.sliderClone || ! this.currentSlider ) {
                return;
            }

            const isVertical = this.currentSlider.isVertical;
            const interactionMode = this.currentSlider.interactionMode;
            let isDragging = false;
            let currentPosition = this.currentSlider.currentPosition;

            // Get elements
            const handle = this.sliderClone.querySelector( '.sba-slider__handle' );
            const beforeLabel = this.sliderClone.querySelector( '.sba-slider__label--before' );
            const afterLabel = this.sliderClone.querySelector( '.sba-slider__label--after' );

            // Update labels visibility for clone
            const updateCloneLabelsVisibility = ( percent ) => {
                if ( isVertical ) {
                    // Vertical mode
                    const sliderHeight = this.sliderClone.offsetHeight;
                    const slicePositionPx = ( percent / 100 ) * sliderHeight;

                    if ( beforeLabel ) {
                        const labelTop = beforeLabel.offsetTop;
                        const labelBottom = labelTop + beforeLabel.offsetHeight;

                        if ( slicePositionPx <= labelTop ) {
                            beforeLabel.style.clipPath = 'inset(0 0 100% 0)';
                        } else if ( slicePositionPx >= labelBottom ) {
                            beforeLabel.style.clipPath = 'none';
                        } else {
                            const visibleHeight = slicePositionPx - labelTop;
                            const clipBottom = beforeLabel.offsetHeight - visibleHeight;
                            beforeLabel.style.clipPath = `inset(0 0 ${clipBottom}px 0)`;
                        }
                    }

                    if ( afterLabel ) {
                        const labelTop = afterLabel.offsetTop;
                        const labelBottom = labelTop + afterLabel.offsetHeight;

                        if ( slicePositionPx >= labelBottom ) {
                            afterLabel.style.clipPath = 'inset(100% 0 0 0)';
                        } else if ( slicePositionPx <= labelTop ) {
                            afterLabel.style.clipPath = 'none';
                        } else {
                            const clipTop = slicePositionPx - labelTop;
                            afterLabel.style.clipPath = `inset(${clipTop}px 0 0 0)`;
                        }
                    }
                } else {
                    // Horizontal mode
                    const sliderWidth = this.sliderClone.offsetWidth;
                    const slicePositionPx = ( percent / 100 ) * sliderWidth;

                    if ( beforeLabel ) {
                        const labelLeft = beforeLabel.offsetLeft;
                        const labelRight = labelLeft + beforeLabel.offsetWidth;

                        if ( slicePositionPx <= labelLeft ) {
                            beforeLabel.style.clipPath = 'inset(0 100% 0 0)';
                        } else if ( slicePositionPx >= labelRight ) {
                            beforeLabel.style.clipPath = 'none';
                        } else {
                            const visibleWidth = slicePositionPx - labelLeft;
                            const clipRight = beforeLabel.offsetWidth - visibleWidth;
                            beforeLabel.style.clipPath = `inset(0 ${clipRight}px 0 0)`;
                        }
                    }

                    if ( afterLabel ) {
                        const labelLeft = afterLabel.offsetLeft;
                        const labelRight = labelLeft + afterLabel.offsetWidth;

                        if ( slicePositionPx >= labelRight ) {
                            afterLabel.style.clipPath = 'inset(0 0 0 100%)';
                        } else if ( slicePositionPx <= labelLeft ) {
                            afterLabel.style.clipPath = 'none';
                        } else {
                            const clipLeft = slicePositionPx - labelLeft;
                            afterLabel.style.clipPath = `inset(0 0 0 ${clipLeft}px)`;
                        }
                    }
                }
            };

            // Set position
            const setPosition = ( percent ) => {
                percent = Math.max( 0, Math.min( 100, percent ) );
                currentPosition = percent;
                this.sliderClone.style.setProperty( '--sba-position', `${ percent }%` );
                if ( handle ) {
                    handle.setAttribute( 'aria-valuenow', Math.round( percent ) );
                }
                // Update labels visibility
                updateCloneLabelsVisibility( percent );
            };

            // Get position from event
            const getPositionFromEvent = ( clientX, clientY ) => {
                const rect = this.sliderClone.getBoundingClientRect();
                if ( isVertical ) {
                    return ( ( clientY - rect.top ) / rect.height ) * 100;
                }
                return ( ( clientX - rect.left ) / rect.width ) * 100;
            };

            // Mouse handlers
            let isHovering = false;

            const onMouseDown = ( e ) => {
                if ( interactionMode !== 'drag' ) return;
                e.preventDefault();
                isDragging = true;
                this.sliderClone.classList.add( 'sba-slider--dragging' );
                setPosition( getPositionFromEvent( e.clientX, e.clientY ) );
            };

            const onMouseMove = ( e ) => {
                if ( interactionMode === 'hover' ) {
                    // Hover mode: only follow mouse when hovering over clone
                    if ( isHovering ) {
                        setPosition( getPositionFromEvent( e.clientX, e.clientY ) );
                    }
                } else if ( isDragging ) {
                    setPosition( getPositionFromEvent( e.clientX, e.clientY ) );
                }
            };

            const onMouseUp = () => {
                if ( isDragging ) {
                    isDragging = false;
                    this.sliderClone.classList.remove( 'sba-slider--dragging' );
                }
            };

            const onMouseEnter = () => {
                if ( interactionMode === 'hover' ) {
                    isHovering = true;
                    this.sliderClone.classList.add( 'sba-slider--hovering' );
                }
            };

            const onMouseLeave = () => {
                if ( interactionMode === 'hover' ) {
                    isHovering = false;
                    this.sliderClone.classList.remove( 'sba-slider--hovering' );
                }
            };

            // Touch handlers
            const onTouchStart = ( e ) => {
                if ( e.touches.length === 1 ) {
                    e.preventDefault();
                    isDragging = true;
                    this.sliderClone.classList.add( 'sba-slider--dragging' );
                    setPosition( getPositionFromEvent( e.touches[0].clientX, e.touches[0].clientY ) );
                }
            };

            const onTouchMove = ( e ) => {
                if ( isDragging && e.touches.length === 1 ) {
                    e.preventDefault();
                    setPosition( getPositionFromEvent( e.touches[0].clientX, e.touches[0].clientY ) );
                }
            };

            const onTouchEnd = () => {
                if ( isDragging ) {
                    isDragging = false;
                    this.sliderClone.classList.remove( 'sba-slider--dragging' );
                }
            };

            // Keyboard handler
            const onKeyDown = ( e ) => {
                const step = e.shiftKey ? 10 : 2;
                let newPosition = currentPosition;

                if ( isVertical ) {
                    switch ( e.key ) {
                        case 'ArrowUp':
                        case 'ArrowLeft':
                            newPosition -= step;
                            break;
                        case 'ArrowDown':
                        case 'ArrowRight':
                            newPosition += step;
                            break;
                        default:
                            return;
                    }
                } else {
                    switch ( e.key ) {
                        case 'ArrowLeft':
                        case 'ArrowDown':
                            newPosition -= step;
                            break;
                        case 'ArrowRight':
                        case 'ArrowUp':
                            newPosition += step;
                            break;
                        default:
                            return;
                    }
                }

                e.preventDefault();
                setPosition( newPosition );
            };

            // Add event listeners
            this.sliderClone.addEventListener( 'mousedown', onMouseDown );
            this.sliderClone.addEventListener( 'mouseenter', onMouseEnter );
            this.sliderClone.addEventListener( 'mouseleave', onMouseLeave );
            document.addEventListener( 'mousemove', onMouseMove );
            document.addEventListener( 'mouseup', onMouseUp );
            this.sliderClone.addEventListener( 'touchstart', onTouchStart, { passive: false } );
            document.addEventListener( 'touchmove', onTouchMove, { passive: false } );
            document.addEventListener( 'touchend', onTouchEnd );

            if ( handle ) {
                handle.addEventListener( 'keydown', onKeyDown );
                handle.setAttribute( 'tabindex', '0' );
            }

            // Prevent image dragging
            this.sliderClone.querySelectorAll( 'img' ).forEach( ( img ) => {
                img.addEventListener( 'dragstart', ( e ) => e.preventDefault() );
            } );

            // Store cleanup function
            this.cleanupClone = () => {
                this.sliderClone.removeEventListener( 'mousedown', onMouseDown );
                this.sliderClone.removeEventListener( 'mouseenter', onMouseEnter );
                this.sliderClone.removeEventListener( 'mouseleave', onMouseLeave );
                document.removeEventListener( 'mousemove', onMouseMove );
                document.removeEventListener( 'mouseup', onMouseUp );
                this.sliderClone.removeEventListener( 'touchstart', onTouchStart );
                document.removeEventListener( 'touchmove', onTouchMove );
                document.removeEventListener( 'touchend', onTouchEnd );
                if ( handle ) {
                    handle.removeEventListener( 'keydown', onKeyDown );
                }
            };
        }

        /**
         * Close the lightbox.
         */
        close() {
            if ( ! this.isOpen || this.isClosing ) {
                return;
            }

            this.isOpen = false;
            this.isClosing = true;

            // Cleanup clone events
            if ( this.cleanupClone ) {
                this.cleanupClone();
                this.cleanupClone = null;
            }

            // Hide lightbox with animation
            this.lightbox.classList.remove( 'sba-lightbox--open' );

            // Wait for animation
            this.closeTimeout = setTimeout( () => {
                this.lightbox.hidden = true;
                this.contentWrapper.innerHTML = '';
                this.sliderClone = null;
                this.currentSlider = null;
                this.isClosing = false;
            }, 300 );

            // Restore body scroll
            document.body.style.overflow = '';

            // Remove escape key listener
            document.removeEventListener( 'keydown', this.onKeyDown );
        }

        /**
         * Handle escape key.
         */
        onKeyDown( e ) {
            if ( e.key === 'Escape' ) {
                this.close();
            }
        }

        /**
         * Handle backdrop click.
         */
        onBackdropClick() {
            this.close();
        }
    }

    /**
     * Get or create lightbox instance.
     */
    function getLightbox() {
        if ( ! lightboxInstance ) {
            lightboxInstance = new SBALightbox();
        }
        return lightboxInstance;
    }

    /**
     * Smart Before/After Slider Class
     */
    class SBASlider {
        constructor( container ) {
            this.container = container;
            this.slider = container.querySelector( '.sba-slider' );
            this.handle = container.querySelector( '.sba-slider__handle' );
            this.cta = container.querySelector( '[data-sba-cta]' );
            this.fullscreenBtn = container.querySelector( '[data-sba-fullscreen-trigger]' );

            // Cache label elements
            this.beforeLabel = this.slider?.querySelector( '.sba-slider__label--before' );
            this.afterLabel = this.slider?.querySelector( '.sba-slider__label--after' );

            // Settings from data attributes
            this.startPosition = parseFloat( container.dataset.startPosition ) || 50;
            this.orientation = container.dataset.orientation || 'horizontal';
            this.interactionMode = container.dataset.interactionMode || 'drag';
            this.enableFullscreen = container.dataset.enableFullscreen !== 'false';
            this.enableAnimation = container.dataset.enableAnimation !== 'false';
            this.animationType = container.dataset.animationType || 'fade-up';
            this.animationDuration = parseInt( container.dataset.animationDuration, 10 ) || 800;
            this.animationDelay = parseInt( container.dataset.animationDelay, 10 ) || 0;
            this.enableTrigger = container.dataset.enableTrigger === 'true';
            this.triggerThreshold = parseInt( container.dataset.triggerThreshold, 10 ) || 3;
            this.showCTA = container.dataset.showCta === 'true';

            // Derived settings
            this.isVertical = this.orientation === 'vertical';

            // State
            this.isDragging = false;
            this.isHovering = false;
            this.currentPosition = this.startPosition;
            this.dragCount = 0;
            this.ctaTriggered = false;
            this.isDestroyed = false;
            this.isAnimated = false;
            this.animationObserver = null;
            this.animationTimeout = null;

            // Bind methods
            this.onMouseDown = this.onMouseDown.bind( this );
            this.onMouseMove = this.onMouseMove.bind( this );
            this.onMouseUp = this.onMouseUp.bind( this );
            this.onMouseEnter = this.onMouseEnter.bind( this );
            this.onMouseLeave = this.onMouseLeave.bind( this );
            this.onTouchStart = this.onTouchStart.bind( this );
            this.onTouchMove = this.onTouchMove.bind( this );
            this.onTouchEnd = this.onTouchEnd.bind( this );
            this.onKeyDown = this.onKeyDown.bind( this );
            this.onFullscreenClick = this.onFullscreenClick.bind( this );

            this.init();
        }

        /**
         * Initialize the slider.
         */
        init() {
            if ( ! this.slider || ! this.handle ) {
                return;
            }

            // Set initial position
            this.setPosition( this.startPosition );

            // Initialize based on interaction mode
            if ( this.interactionMode === 'hover' ) {
                this.initHoverMode();
            } else {
                this.initDragMode();
            }

            // Keyboard accessibility (both modes)
            this.handle.addEventListener( 'keydown', this.onKeyDown );

            // Fullscreen button
            if ( this.fullscreenBtn && this.enableFullscreen ) {
                this.fullscreenBtn.addEventListener( 'click', this.onFullscreenClick );
            }

            // Prevent image dragging
            this.slider.querySelectorAll( 'img' ).forEach( ( img ) => {
                img.addEventListener( 'dragstart', ( e ) => e.preventDefault() );
            } );

            // Initialize scroll animation
            if ( this.enableAnimation ) {
                this.initScrollAnimation();
            }
        }

        /**
         * Initialize scroll animation using Intersection Observer.
         */
        initScrollAnimation() {
            // Add animation class and set CSS variables
            this.container.classList.add( 'sba-animate' );
            this.container.classList.add( `sba-animate--${ this.animationType }` );
            this.container.style.setProperty( '--sba-animation-duration', `${ this.animationDuration }ms` );

            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
            if ( prefersReducedMotion ) {
                this.container.classList.add( 'sba-animated' );
                return;
            }

            // Create Intersection Observer
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.15, // Trigger when 15% of element is visible
            };

            this.animationObserver = new IntersectionObserver( ( entries ) => {
                entries.forEach( ( entry ) => {
                    if ( entry.isIntersecting && ! this.isAnimated ) {
                        this.isAnimated = true;
                        // Add animated class after delay
                        this.animationTimeout = setTimeout( () => {
                            // Guard against destroyed state
                            if ( ! this.isDestroyed && this.container ) {
                                this.container.classList.add( 'sba-animated' );
                            }
                        }, this.animationDelay );
                        // Unobserve after animation
                        this.animationObserver.unobserve( this.container );
                    }
                } );
            }, observerOptions );

            this.animationObserver.observe( this.container );
        }

        /**
         * Initialize drag mode event listeners.
         */
        initDragMode() {
            // Mouse events
            this.slider.addEventListener( 'mousedown', this.onMouseDown );
            document.addEventListener( 'mousemove', this.onMouseMove );
            document.addEventListener( 'mouseup', this.onMouseUp );

            // Touch events
            this.slider.addEventListener( 'touchstart', this.onTouchStart, { passive: false } );
            document.addEventListener( 'touchmove', this.onTouchMove, { passive: false } );
            document.addEventListener( 'touchend', this.onTouchEnd );
        }

        /**
         * Initialize hover mode event listeners.
         */
        initHoverMode() {
            // Mouse events for hover
            this.slider.addEventListener( 'mouseenter', this.onMouseEnter );
            this.slider.addEventListener( 'mousemove', this.onMouseMove );
            this.slider.addEventListener( 'mouseleave', this.onMouseLeave );

            // Touch events (fallback for touch devices)
            this.slider.addEventListener( 'touchstart', this.onTouchStart, { passive: false } );
            document.addEventListener( 'touchmove', this.onTouchMove, { passive: false } );
            document.addEventListener( 'touchend', this.onTouchEnd );
        }

        /**
         * Destroy the slider and cleanup event listeners.
         */
        destroy() {
            if ( this.isDestroyed ) {
                return;
            }

            this.isDestroyed = true;

            // Remove all event listeners
            if ( this.slider ) {
                this.slider.removeEventListener( 'mousedown', this.onMouseDown );
                this.slider.removeEventListener( 'mouseenter', this.onMouseEnter );
                this.slider.removeEventListener( 'mousemove', this.onMouseMove );
                this.slider.removeEventListener( 'mouseleave', this.onMouseLeave );
                this.slider.removeEventListener( 'touchstart', this.onTouchStart );
            }

            document.removeEventListener( 'mousemove', this.onMouseMove );
            document.removeEventListener( 'mouseup', this.onMouseUp );
            document.removeEventListener( 'touchmove', this.onTouchMove );
            document.removeEventListener( 'touchend', this.onTouchEnd );

            // Remove keyboard events
            if ( this.handle ) {
                this.handle.removeEventListener( 'keydown', this.onKeyDown );
            }

            // Remove fullscreen button event
            if ( this.fullscreenBtn ) {
                this.fullscreenBtn.removeEventListener( 'click', this.onFullscreenClick );
            }

            // Disconnect animation observer
            if ( this.animationObserver ) {
                this.animationObserver.disconnect();
                this.animationObserver = null;
            }

            // Clear animation timeout
            if ( this.animationTimeout ) {
                clearTimeout( this.animationTimeout );
                this.animationTimeout = null;
            }

            // Clear references
            this.container = null;
            this.slider = null;
            this.handle = null;
            this.cta = null;
            this.fullscreenBtn = null;
            this.beforeLabel = null;
            this.afterLabel = null;
        }

        /**
         * Set slider position.
         */
        setPosition( percent ) {
            if ( this.isDestroyed ) {
                return;
            }

            percent = Math.max( 0, Math.min( 100, percent ) );
            this.currentPosition = percent;
            this.slider.style.setProperty( '--sba-position', `${ percent }%` );

            // Update ARIA
            this.handle.setAttribute( 'aria-valuenow', Math.round( percent ) );

            // Update labels visibility
            this.updateLabelsVisibility( percent );
        }

        /**
         * Update labels visibility based on slider position.
         * Uses clip-path with pixel calculations for smooth reveal/hide.
         * Supports both horizontal and vertical orientations.
         */
        updateLabelsVisibility( percent ) {
            if ( this.isVertical ) {
                this.updateLabelsVisibilityVertical( percent );
            } else {
                this.updateLabelsVisibilityHorizontal( percent );
            }
        }

        /**
         * Update labels visibility for horizontal mode.
         */
        updateLabelsVisibilityHorizontal( percent ) {
            const sliderWidth = this.slider.offsetWidth;
            const slicePositionPx = ( percent / 100 ) * sliderWidth;

            // Before label: clip from right when slice hasn't passed it yet
            if ( this.beforeLabel ) {
                const labelLeft = this.beforeLabel.offsetLeft;
                const labelRight = labelLeft + this.beforeLabel.offsetWidth;

                if ( slicePositionPx <= labelLeft ) {
                    this.beforeLabel.style.clipPath = 'inset(0 100% 0 0)';
                } else if ( slicePositionPx >= labelRight ) {
                    this.beforeLabel.style.clipPath = 'none';
                } else {
                    const visibleWidth = slicePositionPx - labelLeft;
                    const clipRight = this.beforeLabel.offsetWidth - visibleWidth;
                    this.beforeLabel.style.clipPath = `inset(0 ${clipRight}px 0 0)`;
                }
            }

            // After label: clip from left when slice passes it
            if ( this.afterLabel ) {
                const labelLeft = this.afterLabel.offsetLeft;
                const labelRight = labelLeft + this.afterLabel.offsetWidth;

                if ( slicePositionPx >= labelRight ) {
                    this.afterLabel.style.clipPath = 'inset(0 0 0 100%)';
                } else if ( slicePositionPx <= labelLeft ) {
                    this.afterLabel.style.clipPath = 'none';
                } else {
                    const clipLeft = slicePositionPx - labelLeft;
                    this.afterLabel.style.clipPath = `inset(0 0 0 ${clipLeft}px)`;
                }
            }
        }

        /**
         * Update labels visibility for vertical mode.
         */
        updateLabelsVisibilityVertical( percent ) {
            const sliderHeight = this.slider.offsetHeight;
            const slicePositionPx = ( percent / 100 ) * sliderHeight;

            // Before label: clip from bottom when slice hasn't passed it yet
            if ( this.beforeLabel ) {
                const labelTop = this.beforeLabel.offsetTop;
                const labelBottom = labelTop + this.beforeLabel.offsetHeight;

                if ( slicePositionPx <= labelTop ) {
                    this.beforeLabel.style.clipPath = 'inset(0 0 100% 0)';
                } else if ( slicePositionPx >= labelBottom ) {
                    this.beforeLabel.style.clipPath = 'none';
                } else {
                    const visibleHeight = slicePositionPx - labelTop;
                    const clipBottom = this.beforeLabel.offsetHeight - visibleHeight;
                    this.beforeLabel.style.clipPath = `inset(0 0 ${clipBottom}px 0)`;
                }
            }

            // After label: clip from top when slice passes it
            if ( this.afterLabel ) {
                const labelTop = this.afterLabel.offsetTop;
                const labelBottom = labelTop + this.afterLabel.offsetHeight;

                if ( slicePositionPx >= labelBottom ) {
                    this.afterLabel.style.clipPath = 'inset(100% 0 0 0)';
                } else if ( slicePositionPx <= labelTop ) {
                    this.afterLabel.style.clipPath = 'none';
                } else {
                    const clipTop = slicePositionPx - labelTop;
                    this.afterLabel.style.clipPath = `inset(${clipTop}px 0 0 0)`;
                }
            }
        }

        /**
         * Get position from event coordinates.
         * Uses clientX for horizontal, clientY for vertical.
         */
        getPositionFromEvent( clientX, clientY ) {
            const rect = this.slider.getBoundingClientRect();

            if ( this.isVertical ) {
                const y = clientY - rect.top;
                return ( y / rect.height ) * 100;
            } else {
                const x = clientX - rect.left;
                return ( x / rect.width ) * 100;
            }
        }

        /**
         * Mouse down handler (drag mode).
         */
        onMouseDown( e ) {
            if ( this.interactionMode !== 'drag' ) {
                return;
            }
            // Ignore if clicking fullscreen button
            if ( e.target.closest( '.sba-fullscreen-btn' ) ) {
                return;
            }
            e.preventDefault();
            this.startDrag( e.clientX, e.clientY );
        }

        /**
         * Mouse move handler (both modes).
         */
        onMouseMove( e ) {
            if ( this.interactionMode === 'hover' ) {
                // Hover mode: always follow mouse when hovering
                if ( this.isHovering ) {
                    this.setPosition( this.getPositionFromEvent( e.clientX, e.clientY ) );
                }
            } else {
                // Drag mode: only when dragging
                if ( this.isDragging ) {
                    this.updateDrag( e.clientX, e.clientY );
                }
            }
        }

        /**
         * Mouse up handler (drag mode).
         */
        onMouseUp() {
            if ( this.interactionMode !== 'drag' ) {
                return;
            }
            if ( this.isDragging ) {
                this.endDrag();
            }
        }

        /**
         * Mouse enter handler (hover mode).
         */
        onMouseEnter( e ) {
            if ( this.interactionMode !== 'hover' ) {
                return;
            }
            this.isHovering = true;
            this.slider.classList.add( 'sba-slider--hovering' );
            this.setPosition( this.getPositionFromEvent( e.clientX, e.clientY ) );
        }

        /**
         * Mouse leave handler (hover mode).
         */
        onMouseLeave() {
            if ( this.interactionMode !== 'hover' ) {
                return;
            }
            this.isHovering = false;
            this.slider.classList.remove( 'sba-slider--hovering' );
            
            // Stay at current position (don't animate back)
            // Track interaction when leaving
            this.trackInteraction();
        }

        /**
         * Touch start handler.
         */
        onTouchStart( e ) {
            // Ignore if touching fullscreen button
            if ( e.target.closest( '.sba-fullscreen-btn' ) ) {
                return;
            }
            if ( e.touches.length === 1 ) {
                e.preventDefault();
                this.startDrag( e.touches[ 0 ].clientX, e.touches[ 0 ].clientY );
            }
        }

        /**
         * Touch move handler.
         */
        onTouchMove( e ) {
            if ( ! this.isDragging || e.touches.length !== 1 ) {
                return;
            }
            e.preventDefault();
            this.updateDrag( e.touches[ 0 ].clientX, e.touches[ 0 ].clientY );
        }

        /**
         * Touch end handler.
         */
        onTouchEnd() {
            if ( this.isDragging ) {
                this.endDrag();
            }
        }

        /**
         * Keyboard handler.
         * For vertical mode: Up/Down are primary controls.
         * For horizontal mode: Left/Right are primary controls.
         */
        onKeyDown( e ) {
            const step = e.shiftKey ? 10 : 2;
            let newPosition = this.currentPosition;

            if ( this.isVertical ) {
                // Vertical: Up decreases, Down increases
                switch ( e.key ) {
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        newPosition -= step;
                        break;
                    case 'ArrowDown':
                    case 'ArrowRight':
                        newPosition += step;
                        break;
                    case 'Home':
                        newPosition = 0;
                        break;
                    case 'End':
                        newPosition = 100;
                        break;
                    default:
                        return;
                }
            } else {
                // Horizontal: Left decreases, Right increases
                switch ( e.key ) {
                    case 'ArrowLeft':
                    case 'ArrowDown':
                        newPosition -= step;
                        break;
                    case 'ArrowRight':
                    case 'ArrowUp':
                        newPosition += step;
                        break;
                    case 'Home':
                        newPosition = 0;
                        break;
                    case 'End':
                        newPosition = 100;
                        break;
                    default:
                        return;
                }
            }

            e.preventDefault();
            this.setPosition( newPosition );
            this.trackInteraction();
        }

        /**
         * Fullscreen button click handler.
         */
        onFullscreenClick( e ) {
            e.preventDefault();
            e.stopPropagation();

            const lightbox = getLightbox();
            lightbox.open( this );
        }

        /**
         * Start dragging.
         */
        startDrag( clientX, clientY ) {
            this.isDragging = true;
            this.slider.classList.add( 'sba-slider--dragging' );
            this.setPosition( this.getPositionFromEvent( clientX, clientY ) );
        }

        /**
         * Update during drag.
         */
        updateDrag( clientX, clientY ) {
            this.setPosition( this.getPositionFromEvent( clientX, clientY ) );
        }

        /**
         * End dragging.
         */
        endDrag() {
            this.isDragging = false;
            this.slider.classList.remove( 'sba-slider--dragging' );
            this.trackInteraction();
        }

        /**
         * Track user interaction and trigger CTA if threshold met.
         */
        trackInteraction() {
            this.dragCount++;

            // Check if trigger conditions are met
            if ( this.enableTrigger && this.showCTA && ! this.ctaTriggered ) {
                if ( this.dragCount >= this.triggerThreshold ) {
                    this.triggerCTA();
                }
            }
        }

        /**
         * Show the CTA button.
         */
        triggerCTA() {
            if ( ! this.cta || this.ctaTriggered ) {
                return;
            }

            this.ctaTriggered = true;
            this.cta.removeAttribute( 'hidden' );

            // Trigger animation after a brief delay
            requestAnimationFrame( () => {
                if ( this.cta ) {
                    this.cta.classList.add( 'sba-cta--visible' );
                }
            } );

            // Dispatch custom event
            if ( this.container ) {
                this.container.dispatchEvent(
                    new CustomEvent( 'sba:cta-triggered', {
                        detail: {
                            blockId: this.container.dataset.blockId,
                            dragCount: this.dragCount,
                        },
                    } )
                );
            }
        }
    }

    /**
     * Initialize a single slider.
     *
     * @param {Element} container - The slider container element.
     */
    function initSlider( container ) {
        // Skip if already initialized
        if ( container.dataset.sbaInitialized || sliderInstances.has( container ) ) {
            return;
        }

        container.dataset.sbaInitialized = 'true';
        const instance = new SBASlider( container );
        sliderInstances.set( container, instance );
    }

    /**
     * Destroy a slider instance.
     *
     * @param {Element} container - The slider container element.
     */
    function destroySlider( container ) {
        const instance = sliderInstances.get( container );
        if ( instance ) {
            instance.destroy();
            sliderInstances.delete( container );
        }
    }

    /**
     * Initialize all sliders on the page.
     */
    function initSliders() {
        const containers = document.querySelectorAll( '.sba-container' );
        containers.forEach( initSlider );
    }

    /**
     * Handle mutations for dynamic content.
     *
     * @param {MutationRecord[]} mutations - Array of mutation records.
     */
    function handleMutations( mutations ) {
        mutations.forEach( ( mutation ) => {
            // Handle added nodes
            mutation.addedNodes.forEach( ( node ) => {
                if ( node.nodeType !== Node.ELEMENT_NODE ) {
                    return;
                }

                // Check if the node itself is a slider
                if ( node.classList && node.classList.contains( 'sba-container' ) ) {
                    initSlider( node );
                }

                // Check for sliders within the node
                if ( node.querySelectorAll ) {
                    const sliders = node.querySelectorAll( '.sba-container:not([data-sba-initialized])' );
                    sliders.forEach( initSlider );
                }
            } );

            // Handle removed nodes (cleanup)
            mutation.removedNodes.forEach( ( node ) => {
                if ( node.nodeType !== Node.ELEMENT_NODE ) {
                    return;
                }

                // Check if the node itself is a slider
                if ( node.classList && node.classList.contains( 'sba-container' ) ) {
                    destroySlider( node );
                }

                // Check for sliders within the node
                if ( node.querySelectorAll ) {
                    const sliders = node.querySelectorAll( '.sba-container' );
                    sliders.forEach( destroySlider );
                }
            } );
        } );
    }

    /**
     * Setup MutationObserver for dynamic content.
     */
    function setupObserver() {
        // Only observe if MutationObserver is available
        if ( typeof MutationObserver === 'undefined' ) {
            return;
        }

        const observer = new MutationObserver( handleMutations );

        // Observe with minimal scope - only direct children changes
        observer.observe( document.body, {
            childList: true,
            subtree: true,
        } );

        // Cleanup on page unload
        window.addEventListener( 'unload', () => {
            observer.disconnect();
        } );
    }

    /**
     * Main initialization.
     */
    function main() {
        initSliders();
        setupObserver();
    }

    // Initialize on DOM ready
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', main );
    } else {
        main();
    }
} )();