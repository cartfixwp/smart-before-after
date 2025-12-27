/**
 * Edit component for Smart Before After block.
 *
 * @package SmartBeforeAfter
 */

import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    PanelColorSettings,
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    TextControl,
    TextareaControl,
    RangeControl,
    ToggleControl,
    SelectControl,
    Placeholder,
} from '@wordpress/components';
import { useEffect, useCallback } from '@wordpress/element';

/**
 * Edit component.
 */
export default function Edit( { attributes, setAttributes, clientId } ) {
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

    // Set unique block ID using clientId.
    useEffect( () => {
        if ( ! blockId && clientId ) {
            setAttributes( { blockId: `sba-${ clientId.substring( 0, 8 ) }` } );
        }
    }, [ blockId, clientId, setAttributes ] );

    const blockProps = useBlockProps( {
        className: 'sba-editor-wrapper',
    } );

    // Determine if vertical mode
    const isVertical = orientation === 'vertical';

    /**
     * Handle image selection.
     */
    const onSelectBeforeImage = useCallback(
        ( media ) => {
            setAttributes( {
                beforeImage: {
                    id: media.id,
                    url: media.url,
                    alt: media.alt || '',
                    width: media.width,
                    height: media.height,
                },
            } );
        },
        [ setAttributes ]
    );

    const onSelectAfterImage = useCallback(
        ( media ) => {
            setAttributes( {
                afterImage: {
                    id: media.id,
                    url: media.url,
                    alt: media.alt || '',
                    width: media.width,
                    height: media.height,
                },
            } );
        },
        [ setAttributes ]
    );

    /**
     * Remove image.
     */
    const onRemoveBeforeImage = useCallback( () => {
        setAttributes( { beforeImage: null } );
    }, [ setAttributes ] );

    const onRemoveAfterImage = useCallback( () => {
        setAttributes( { afterImage: null } );
    }, [ setAttributes ] );

    /**
     * Render image upload placeholder.
     */
    const renderImageUpload = ( type ) => {
        const isBefore = type === 'before';
        const image = isBefore ? beforeImage : afterImage;
        const label = isBefore
            ? __( 'Before Image', 'smart-before-after' )
            : __( 'After Image', 'smart-before-after' );
        const onSelect = isBefore ? onSelectBeforeImage : onSelectAfterImage;
        const onRemove = isBefore ? onRemoveBeforeImage : onRemoveAfterImage;

        return (
            <div className={ `sba-image-upload sba-image-upload--${ type }` }>
                <MediaUploadCheck>
                    <MediaUpload
                        onSelect={ onSelect }
                        allowedTypes={ [ 'image' ] }
                        value={ image?.id }
                        render={ ( { open } ) => (
                            <>
                                { image?.url ? (
                                    <div className="sba-image-preview">
                                        <img src={ image.url } alt={ image.alt } />
                                        <div className="sba-image-actions">
                                            <Button
                                                onClick={ open }
                                                variant="secondary"
                                                size="small"
                                            >
                                                { __( 'Replace', 'smart-before-after' ) }
                                            </Button>
                                            <Button
                                                onClick={ onRemove }
                                                variant="secondary"
                                                isDestructive
                                                size="small"
                                            >
                                                { __( 'Remove', 'smart-before-after' ) }
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Placeholder
                                        icon="format-image"
                                        label={ label }
                                        instructions={ __(
                                            'Upload or select an image',
                                            'smart-before-after'
                                        ) }
                                    >
                                        <Button onClick={ open } variant="primary">
                                            { __( 'Upload Image', 'smart-before-after' ) }
                                        </Button>
                                    </Placeholder>
                                ) }
                            </>
                        ) }
                    />
                </MediaUploadCheck>
            </div>
        );
    };

    /**
     * Render caption element.
     */
    const renderCaption = () => {
        if ( ! showCaption ) {
            return null;
        }

        // Check if caption has actual content (not just whitespace)
        const hasContent = captionText && captionText.trim().length > 0;

        if ( ! hasContent ) {
            // Show placeholder in editor when caption is enabled but empty
            return (
                <p className="sba-caption sba-caption--center sba-caption--placeholder">
                    { __( '(Caption will appear here)', 'smart-before-after' ) }
                </p>
            );
        }

        return (
            <p
                className={ `sba-caption sba-caption--${ captionAlignment ?? 'center' }` }
            >
                { captionText }
            </p>
        );
    };

    /**
     * Render slider preview.
     */
    const renderSliderPreview = () => {
        if ( ! beforeImage?.url || ! afterImage?.url ) {
            return null;
        }

        // Build slider class names
        const sliderClasses = [
            'sba-slider',
            isVertical ? 'sba-slider--vertical' : '',
        ].filter( Boolean ).join( ' ' );

        return (
            <div className="sba-slider-preview">
                <div className="sba-preview-label">
                    { __( 'Preview', 'smart-before-after' ) }
                </div>

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
                        <img src={ afterImage.url } alt={ afterImage.alt } />
                    </div>

                    { /* Before Image (overlay with clip-path) */ }
                    <div className="sba-slider__before">
                        <img src={ beforeImage.url } alt={ beforeImage.alt } />
                        { showLabels && (
                            <span className="sba-slider__label sba-slider__label--before">
                                { beforeLabel }
                            </span>
                        ) }
                    </div>

                    { /* After Label (with inverse clip-path) */ }
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
                    >
                        <span className="sba-slider__handle-icon">
                            { isVertical ? '⬍' : '⬌' }
                        </span>
                    </div>

                    { /* Divider Line */ }
                    <div
                        className="sba-slider__divider"
                        style={ { '--sba-handle-color': handleColor } }
                    ></div>

                    { /* Fullscreen Button Preview */ }
                    { ( enableFullscreen ?? true ) && (
                        <div className="sba-fullscreen-btn sba-fullscreen-btn--preview">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                            </svg>
                        </div>
                    ) }
                </div>

                { /* Caption Below */ }
                { ( captionPosition === 'below' || ! captionPosition ) && renderCaption() }

                { /* CTA Preview */ }
                { showCTA && (
                    <div className="sba-cta-preview">
                        <button
                            className="sba-cta-button"
                            style={ {
                                backgroundColor: ctaBackgroundColor,
                                color: ctaTextColor,
                            } }
                        >
                            { ctaText }
                        </button>
                        <span className="sba-cta-note">
                            { __( '(Appears after user interaction)', 'smart-before-after' ) }
                        </span>
                    </div>
                ) }
            </div>
        );
    };

    return (
        <>
            <InspectorControls>
                { /* Images Panel */ }
                <PanelBody title={ __( 'Images', 'smart-before-after' ) } initialOpen>
                    <p className="components-base-control__help">
                        { __(
                            'Upload before and after images in the editor area.',
                            'smart-before-after'
                        ) }
                    </p>
                </PanelBody>

                { /* Labels Panel */ }
                <PanelBody
                    title={ __( 'Labels', 'smart-before-after' ) }
                    initialOpen={ false }
                >
                    <ToggleControl
                        label={ __( 'Show Labels', 'smart-before-after' ) }
                        checked={ showLabels }
                        onChange={ ( value ) => setAttributes( { showLabels: value } ) }
                    />
                    { showLabels && (
                        <>
                            <TextControl
                                label={ __( 'Before Label', 'smart-before-after' ) }
                                value={ beforeLabel }
                                onChange={ ( value ) =>
                                    setAttributes( { beforeLabel: value } )
                                }
                            />
                            <TextControl
                                label={ __( 'After Label', 'smart-before-after' ) }
                                value={ afterLabel }
                                onChange={ ( value ) =>
                                    setAttributes( { afterLabel: value } )
                                }
                            />
                        </>
                    ) }
                </PanelBody>

                { /* Label Colors - showLabels = true */ }
                { showLabels && (
                    <PanelColorSettings
                        title={ __( 'Label Colors', 'smart-before-after' ) }
                        initialOpen={ false }
                        colorSettings={ [
                            {
                                value: labelBackgroundColor,
                                onChange: ( value ) =>
                                    setAttributes( {
                                        labelBackgroundColor: value || 'rgba(0,0,0,0.8)',
                                    } ),
                                label: __( 'Background Color', 'smart-before-after' ),
                            },
                            {
                                value: labelTextColor,
                                onChange: ( value ) =>
                                    setAttributes( {
                                        labelTextColor: value || '#ffffff',
                                    } ),
                                label: __( 'Text Color', 'smart-before-after' ),
                            },
                        ] }
                    />
                ) }

                { /* Caption Panel */ }
                <PanelBody
                    title={ __( 'Caption', 'smart-before-after' ) }
                    initialOpen={ false }
                >
                    <ToggleControl
                        label={ __( 'Show Caption', 'smart-before-after' ) }
                        help={ __( 'Display a caption below or above the slider.', 'smart-before-after' ) }
                        checked={ showCaption ?? false }
                        onChange={ ( value ) => setAttributes( { showCaption: value } ) }
                    />
                    { showCaption && (
                        <>
                            <TextareaControl
                                label={ __( 'Caption Text', 'smart-before-after' ) }
                                value={ captionText ?? '' }
                                onChange={ ( value ) => setAttributes( { captionText: value } ) }
                                placeholder={ __( 'Enter a description for this comparison...', 'smart-before-after' ) }
                                rows={ 3 }
                            />
                            <SelectControl
                                label={ __( 'Position', 'smart-before-after' ) }
                                value={ captionPosition ?? 'below' }
                                options={ [
                                    {
                                        label: __( 'Below Slider', 'smart-before-after' ),
                                        value: 'below',
                                    },
                                    {
                                        label: __( 'Above Slider', 'smart-before-after' ),
                                        value: 'above',
                                    },
                                ] }
                                onChange={ ( value ) => setAttributes( { captionPosition: value } ) }
                            />
                            <SelectControl
                                label={ __( 'Alignment', 'smart-before-after' ) }
                                value={ captionAlignment ?? 'center' }
                                options={ [
                                    {
                                        label: __( 'Left', 'smart-before-after' ),
                                        value: 'left',
                                    },
                                    {
                                        label: __( 'Center', 'smart-before-after' ),
                                        value: 'center',
                                    },
                                    {
                                        label: __( 'Right', 'smart-before-after' ),
                                        value: 'right',
                                    },
                                ] }
                                onChange={ ( value ) => setAttributes( { captionAlignment: value } ) }
                            />
                        </>
                    ) }
                </PanelBody>

                { /* Slider Settings Panel */ }
                <PanelBody
                    title={ __( 'Slider Settings', 'smart-before-after' ) }
                    initialOpen={ false }
                >
                    <RangeControl
                        label={ __( 'Start Position (%)', 'smart-before-after' ) }
                        value={ startPosition }
                        onChange={ ( value ) => setAttributes( { startPosition: value } ) }
                        min={ 0 }
                        max={ 100 }
                    />
                    <SelectControl
                        label={ __( 'Orientation', 'smart-before-after' ) }
                        value={ orientation ?? 'horizontal' }
                        options={ [
                            {
                                label: __( 'Horizontal', 'smart-before-after' ),
                                value: 'horizontal',
                            },
                            {
                                label: __( 'Vertical', 'smart-before-after' ),
                                value: 'vertical',
                            },
                        ] }
                        onChange={ ( value ) => setAttributes( { orientation: value } ) }
                        help={
                            orientation === 'vertical'
                                ? __( 'Slider moves up and down.', 'smart-before-after' )
                                : __( 'Slider moves left and right.', 'smart-before-after' )
                        }
                    />
                    <SelectControl
                        label={ __( 'Interaction Mode', 'smart-before-after' ) }
                        value={ interactionMode ?? 'drag' }
                        options={ [
                            {
                                label: __( 'Drag', 'smart-before-after' ),
                                value: 'drag',
                            },
                            {
                                label: __( 'Hover', 'smart-before-after' ),
                                value: 'hover',
                            },
                        ] }
                        onChange={ ( value ) => setAttributes( { interactionMode: value } ) }
                        help={
                            interactionMode === 'hover'
                                ? __( 'Slider follows mouse position on hover.', 'smart-before-after' )
                                : __( 'Click and drag to compare images.', 'smart-before-after' )
                        }
                    />
                    <SelectControl
                        label={ __( 'Handle Style', 'smart-before-after' ) }
                        value={ handleStyle }
                        options={ [
                            {
                                label: __( 'Arrows', 'smart-before-after' ),
                                value: 'arrows',
                            },
                            {
                                label: __( 'Circle', 'smart-before-after' ),
                                value: 'circle',
                            },
                            {
                                label: __( 'Line', 'smart-before-after' ),
                                value: 'line',
                            },
                        ] }
                        onChange={ ( value ) => setAttributes( { handleStyle: value } ) }
                    />
                    <RangeControl
                        label={ __( 'Border Radius (px)', 'smart-before-after' ) }
                        value={ borderRadius ?? 8 }
                        onChange={ ( value ) => setAttributes( { borderRadius: value } ) }
                        min={ 0 }
                        max={ 50 }
                    />
                    <ToggleControl
                        label={ __( 'Enable Fullscreen', 'smart-before-after' ) }
                        help={ __( 'Allow users to view the comparison in fullscreen mode.', 'smart-before-after' ) }
                        checked={ enableFullscreen ?? true }
                        onChange={ ( value ) => setAttributes( { enableFullscreen: value } ) }
                    />
                </PanelBody>

                { /* Animation Settings Panel */ }
                <PanelBody
                    title={ __( 'Animation Settings', 'smart-before-after' ) }
                    initialOpen={ false }
                >
                    <ToggleControl
                        label={ __( 'Enable Scroll Animation', 'smart-before-after' ) }
                        help={ __( 'Animate the slider when it enters the viewport.', 'smart-before-after' ) }
                        checked={ enableAnimation ?? true }
                        onChange={ ( value ) => setAttributes( { enableAnimation: value } ) }
                    />
                    { ( enableAnimation ?? true ) && (
                        <>
                            <SelectControl
                                label={ __( 'Animation Type', 'smart-before-after' ) }
                                value={ animationType ?? 'fade-up' }
                                options={ [
                                    {
                                        label: __( 'Fade Up', 'smart-before-after' ),
                                        value: 'fade-up',
                                    },
                                    {
                                        label: __( 'Fade In', 'smart-before-after' ),
                                        value: 'fade-in',
                                    },
                                    {
                                        label: __( 'Zoom In', 'smart-before-after' ),
                                        value: 'zoom-in',
                                    },
                                    {
                                        label: __( 'Slide Left', 'smart-before-after' ),
                                        value: 'slide-left',
                                    },
                                    {
                                        label: __( 'Slide Right', 'smart-before-after' ),
                                        value: 'slide-right',
                                    },
                                ] }
                                onChange={ ( value ) => setAttributes( { animationType: value } ) }
                            />
                            <RangeControl
                                label={ __( 'Duration (ms)', 'smart-before-after' ) }
                                value={ animationDuration ?? 800 }
                                onChange={ ( value ) => setAttributes( { animationDuration: value } ) }
                                min={ 200 }
                                max={ 2000 }
                                step={ 100 }
                            />
                            <RangeControl
                                label={ __( 'Delay (ms)', 'smart-before-after' ) }
                                value={ animationDelay ?? 0 }
                                onChange={ ( value ) => setAttributes( { animationDelay: value } ) }
                                min={ 0 }
                                max={ 1000 }
                                step={ 50 }
                            />
                        </>
                    ) }
                </PanelBody>

                { /* Handle Color */ }
                <PanelColorSettings
                    title={ __( 'Handle Color', 'smart-before-after' ) }
                    initialOpen={ false }
                    colorSettings={ [
                        {
                            value: handleColor,
                            onChange: ( value ) =>
                                setAttributes( { handleColor: value || '#ffffff' } ),
                            label: __( 'Handle Color', 'smart-before-after' ),
                        },
                    ] }
                />

                { /* Smart Trigger Panel */ }
                <PanelBody
                    title={ __( 'Smart Trigger', 'smart-before-after' ) }
                    initialOpen={ false }
                >
                    <ToggleControl
                        label={ __( 'Enable Smart Trigger', 'smart-before-after' ) }
                        help={ __(
                            'Show CTA button after user interacts with the slider.',
                            'smart-before-after'
                        ) }
                        checked={ enableTrigger }
                        onChange={ ( value ) => setAttributes( { enableTrigger: value } ) }
                    />
                    { enableTrigger && (
                        <RangeControl
                            label={ __( 'Trigger after X drags', 'smart-before-after' ) }
                            help={ __(
                                'CTA will appear after user drags this many times.',
                                'smart-before-after'
                            ) }
                            value={ triggerThreshold }
                            onChange={ ( value ) =>
                                setAttributes( { triggerThreshold: value } )
                            }
                            min={ 1 }
                            max={ 10 }
                        />
                    ) }
                </PanelBody>

                { /* CTA Settings Panel */ }
                <PanelBody
                    title={ __( 'CTA Button', 'smart-before-after' ) }
                    initialOpen={ false }
                >
                    <ToggleControl
                        label={ __( 'Show CTA Button', 'smart-before-after' ) }
                        checked={ showCTA }
                        onChange={ ( value ) => setAttributes( { showCTA: value } ) }
                    />
                    { showCTA && (
                        <>
                            <TextControl
                                label={ __( 'Button Text', 'smart-before-after' ) }
                                value={ ctaText }
                                onChange={ ( value ) => setAttributes( { ctaText: value } ) }
                            />
                            <TextControl
                                label={ __( 'Button Link', 'smart-before-after' ) }
                                value={ ctaLink }
                                onChange={ ( value ) => setAttributes( { ctaLink: value } ) }
                                placeholder="https://"
                                type="url"
                            />
                        </>
                    ) }
                </PanelBody>

                { /* CTA Colors */ }
                { showCTA && (
                    <PanelColorSettings
                        title={ __( 'CTA Colors', 'smart-before-after' ) }
                        initialOpen={ false }
                        colorSettings={ [
                            {
                                value: ctaBackgroundColor,
                                onChange: ( value ) =>
                                    setAttributes( {
                                        ctaBackgroundColor: value || '#007bff',
                                    } ),
                                label: __( 'Background Color', 'smart-before-after' ),
                            },
                            {
                                value: ctaTextColor,
                                onChange: ( value ) =>
                                    setAttributes( { ctaTextColor: value || '#ffffff' } ),
                                label: __( 'Text Color', 'smart-before-after' ),
                            },
                        ] }
                    />
                ) }
            </InspectorControls>

            <div { ...blockProps }>
                <div className="sba-block-header">
                    <span className="sba-block-title">
                        { __( 'Smart Before/After', 'smart-before-after' ) }
                    </span>
                </div>

                <div className="sba-image-uploads">
                    { renderImageUpload( 'before' ) }
                    { renderImageUpload( 'after' ) }
                </div>

                { renderSliderPreview() }
            </div>
        </>
    );
}