import {staticFile} from 'remotion';
import {EmojiName} from './get-available-emojis';

export type Format = 'hevc' | 'webm';
export type Scale = '0.5' | '1' | '2';

export type CalculateEmojiSrc = (options: {
	emoji: EmojiName;
	scale: Scale;
	format: Format;
}) => string;

export const defaultCalculateEmojiSrc: CalculateEmojiSrc = ({
	emoji,
	scale,
	format,
}) => {
	const extension = format === 'hevc' ? 'mp4' : 'webm';

	return staticFile(`${emoji}-${scale}x.${extension}`);
};
