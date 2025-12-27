/**
 * Save component for Smart Before After block.
 *
 * @package SmartBeforeAfter
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Sanitize URL to prevent XSS.
 *
 * @param {string} url - The URL to sanitize.
 * @return {string} Safe URL or '#'.
 */
const getSafeUrl = ( url ) => {
    if ( ! url || typeof url !== 'string' ) {
        return '#';
    }

    // Trim whitespace
    const trimmed = url.trim();

    // Allow only safe protocols
    const safeProtocols = [
        'http:',
        'https:',
        'mailto:',
        'tel:',
    ];

    try {
        const parsed = new URL( trimmed, 'https://example.com' );
        if ( safeProtocols.includes( parsed.protocol ) ) {
            return trimmed;
        }
    } catch ( e ) {
        // Invalid URL, check if it's a relative path
        if ( trimmed.startsWith( '/' ) && ! trimmed.startsWith( '//' ) ) {
            return trimmed;
        }
    }

    return '#';
};

/**
 * Save component - renders the frontend HTML.
 */
export default function save( { attributes } ) {
    const {
        beforeImage,
        afterImage,
        beforeLabel,
        afterLabel,
        showLabels,
        labelBackgroundColor,
        labelTextColor,
        showCaption,
        captionText,
        captionPosition,
        captionAlignment,
        startPosition,
        orientation,
        interactionMode,
        handleStyle,
        handleColor,
        borderRadius,
        enableFullscreen,
        enableAnimation,
        animationType,
        animationDuration,
        animationDelay,
        enableTrigger,
        triggerThreshold,
        showCTA,
        ctaText,
        ctaLink,
        ctaBackgroundColor,
        ctaTextColor,
        blockId,
    } = attributes;

    // Don't render if no images.
    if ( ! beforeImage?.url || ! afterImage?.url ) {
        return null;
    }

    // Determine if vertical mode
    const isVertical = orientation === 'vertical';

    const blockProps = useBlockProps.save( {
        className: 'sba-container',
        'data-block-id': blockId,
        'data-start-position': startPosition,
        'data-orientation': orientation ?? 'horizontal',
        'data-interaction-mode': interactionMode ?? 'drag',
        'data-enable-fullscreen': enableFullscreen ?? true,
        'data-enable-animation': enableAnimation ?? true,
        'data-animation-type': animationType ?? 'fade-up',
        'data-animation-duration': animationDuration ?? 800,
        'data-animation-delay': animationDelay ?? 0,
        'data-enable-trigger': enableTrigger,
        'data-trigger-threshold': triggerThreshold,
        'data-show-cta': showCTA,
    } );

    // Sanitize the CTA link
    const safeCtaLink = getSafeUrl( ctaLink );

    // Build slider class names
    const sliderClasses = [
        'sba-slider',
        isVertical ? 'sba-slider--vertical' : '',
    ].filter( Boolean ).join( ' ' );

    // Render caption element
    const renderCaption = () => {
        // Check if caption has actual content (not just whitespace)
        if ( ! showCaption || ! captionText || ! captionText.trim() ) {
            return null;
        }

        return (
            <p
                className={ `sba-caption sba-caption--${ captionAlignment ?? 'center' }` }
            >
                { captionText }
            </p>
        );
    };

    return (
        <div { ...blockProps }>
            { /* Caption Above */ }
            { captionPosition === 'above' && renderCaption() }

            <div
                className={ sliderClasses }
                style={ {
                    '--sba-position': `${ startPosition }%`,
                    '--sba-border-radius': `${ borderRadius ?? 8 }px`,
                    '--sba-label-bg': labelBackgroundColor ?? 'rgba(0,0,0,0.8)',
                    '--sba-label-color': labelTextColor ?? '#ffffff',
                } }
            >
                { /* After Image (base layer) */ }
                <div className="sba-slider__after">
                    <img
                        src={ afterImage.url }
                        alt={ afterImage.alt || afterLabel }
                        loading="lazy"
                    />
                </div>

                { /* Before Image (overlay with clip-path) */ }
                <div className="sba-slider__before">
                    <img
                        src={ beforeImage.url }
                        alt={ beforeImage.alt || beforeLabel }
                        loading="lazy"
                    />
                    { showLabels && (
                        <span className="sba-slider__label sba-slider__label--before">
                            { beforeLabel }
                        </span>
                    ) }
                </div>

                { /* After Label (in separate wrapper) */ }
                { showLabels && (
                    <div className="sba-slider__after-label-wrapper">
                        <span className="sba-slider__label sba-slider__label--after">
                            { afterLabel }
                        </span>
                    </div>
                ) }

                { /* Handle */ }
                <div
                    className={ `sba-slider__handle sba-slider__handle--${ handleStyle }` }
                    style={ { '--sba-handle-color': handleColor } }
                    role="slider"
                    aria-label={ __( 'Image comparison slider', 'smart-before-after' ) }
                    aria-valuemin={ 0 }
                    aria-valuemax={ 100 }
                    aria-valuenow={ startPosition }
                    aria-orientation={ isVertical ? 'vertical' : 'horizontal' }
                    tabIndex={ 0 }
                >
                    { handleStyle === 'arrows' && (
                        <span className="sba-slider__handle-arrows">
                            { isVertical ? (
                                <>
                                    <span className="sba-arrow sba-arrow--up">▲</span>
                                    <span className="sba-arrow sba-arrow--down">▼</span>
                                </>
                            ) : (
                                <>
                                    <span className="sba-arrow sba-arrow--left">◀</span>
                                    <span className="sba-arrow sba-arrow--right">▶</span>
                                </>
                            ) }
                        </span>
                    ) }
                    { handleStyle === 'circle' && (
                        <span className="sba-slider__handle-circle"></span>
                    ) }
                    { handleStyle === 'line' && (
                        <span className="sba-slider__handle-line"></span>
                    ) }
                </div>

                { /* Divider Line */ }
                <div
                    className="sba-slider__divider"
                    style={ { '--sba-handle-color': handleColor } }
                ></div>

                { /* Fullscreen Button */ }
                { ( enableFullscreen ?? true ) && (
                    <button
                        className="sba-fullscreen-btn"
                        type="button"
                        aria-label={ __( 'View fullscreen', 'smart-before-after' ) }
                        data-sba-fullscreen-trigger
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                    </button>
                ) }
            </div>

            { /* Caption Below */ }
            { ( captionPosition === 'below' || ! captionPosition ) && renderCaption() }

            { /* CTA Button (hidden by default, shown via JS) */ }
            { showCTA && (
                <div className="sba-cta" data-sba-cta hidden>
                    <a
                        href={ safeCtaLink }
                        className="sba-cta__button"
                        style={ {
                            '--sba-cta-bg': ctaBackgroundColor,
                            '--sba-cta-color': ctaTextColor,
                        } }
                    >
                        { ctaText }
                    </a>
                </div>
            ) }
        </div>
    );
}