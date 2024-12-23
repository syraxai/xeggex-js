import { getRandomInt } from '../utils/math.js';
import Queue from '../utils/queue.js';
import requestImage from './requestimage.js';

const getPromptVariation = (prompt, position) => {
	const insideCurlyBracesRegex = /\{.+?\}/g
	const parts = prompt?.split(insideCurlyBracesRegex)
	const groups = prompt?.match(insideCurlyBracesRegex)?.map(str => str.slice(1, -1).split(`|`))

	if (!groups)
		return prompt

	const variations = groups.map(group => group[position % group.length])

	const promptVariation = parts.reduce((result, part, index) => {
		const variation = variations[index] ?? ``
		return result + part + variation
	}, "")

	return promptVariation
}

const requestBatch = (
	prompt,
	negativePrompt, 
	model,
	seed,
	initImage,
	denoising,
	subseed,
	subseedStrength,
	steps,
	cfg,
	width,
	height,
	sampler,
	hrScale,
	latentSpace,
	clipSkip,
	batchCount = hrScale > 1 ? 1 : 4,
) => {

	const randomSeed = getRandomInt(1_000_000_000, 9_999_999_999) // 10 digits
	
	const dynamicParameters = new Array(batchCount).fill()
		.map((_, i) => ({
			prompt: getPromptVariation(prompt, i) || undefined,
			negativePrompt: getPromptVariation(negativePrompt, i) || undefined,
			seed: seed ?? randomSeed + i,
		}))

	const requests = dynamicParameters
		.map(dynamicData => requestImage(
			dynamicData.prompt,
			dynamicData.negativePrompt,
			model,
			dynamicData.seed,
			initImage,
			denoising,
			subseed,
			subseedStrength,
			steps,
			cfg,
			width,
			height,
			sampler,
			hrScale,
			latentSpace,
			clipSkip,
		))

	return requests
}

export default requestBatch
