/**
 * Smart Before After Block
 *
 * @package SmartBeforeAfter
 */

import { registerBlockType } from '@wordpress/blocks';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Block Icon
 */
const blockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path d="M4 4h16v16H4V4zm2 2v12h5V6H6zm7 0v12h5V6h-5zm-1 5v2h2v-2h-2z" fill="currentColor"/>
    </svg>
);

/**
 * Register the block.
 */
registerBlockType( metadata.name, {
    icon: blockIcon,
    edit: Edit,
    save,
} );