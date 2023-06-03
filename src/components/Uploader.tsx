import React from 'react';
import SwitchButton from './buttons/SwitchButton';
import FileInputButton from './FileInputButton';
import Tooltip from './Tooltip';
import { LoadingOverlay } from '@mantine/core';
import OptionalSetting from './OptionalSetting';
import { ExclamationMark } from 'tabler-icons-react';
import Link from 'next/link';
import useLocalStorage from '../hooks/useLocalStorage';

export type UploaderProps = {
	setLanguageCode: (languageCode: string) => void;
	setAdjusting: (adjusting: boolean) => void;
	adjusting: boolean;
	setAdjustment: (adjustment: number) => void;
	adjustment: number;
	ignoreAside: boolean;
	setIgnoreAside: (ignoreAside: boolean) => void;
	parentHighlighting: boolean;
	setParentHighlighting: (parentHighlighting: boolean) => void;
	skipPageNumbering: boolean;
	setSkipPageNumbering: (skipPageNumbering: boolean) => void;
	multipleHeaders: boolean;
	setMultipleHeaders: (multipleHeaders: boolean) => void;
	handleFileUpload: (formData: FormData) => void;
	setInputType: (inputType: 'daisy' | 'pdf' | undefined) => void;
	uploading: boolean;
};

const Uploader = ({
	setLanguageCode,
	setAdjusting,
	adjusting,
	setAdjustment,
	adjustment,
	ignoreAside,
	setIgnoreAside,
	parentHighlighting,
	setParentHighlighting,
	skipPageNumbering,
	setSkipPageNumbering,
	multipleHeaders,
	setMultipleHeaders,
	handleFileUpload,
	setInputType,
	uploading,
}: UploaderProps) => {
	const [showing, setShowing] = React.useState<'daisy' | 'epub' | 'pdf'>('epub');
	const [settingsEpub, setSettingsEpub] = useLocalStorage('settingEpub', {
		adjusting: false,
		adjustment: 125,
		ignoreAside: false,
		skipPageNumbering: false,
		parentHighlighting: false,
	});
	const [settingsDaisy, setSettingsDaisy] = useLocalStorage('settingDaisy', {
		adjusting: false,
		adjustment: 125,
		ignoreAside: false,
		skipPageNumbering: false,
		multipleHeaders: false,
	});
	const [settingsPdf, setSettingsPdf] = useLocalStorage('settingPdf', {
		skipPageNumbering: true,
	});
	const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// only allow values between 0 and 10000
		const value = parseInt(e.target.value, 10);
		if (value >= 10000) {
			setAdjustment(10000);
		}
		if (value >= 0 && value <= 10000) {
			setAdjustment(value);
		}
		if (isNaN(value)) {
			setAdjustment(0);
		}
	};

	const handleSwitch = (show: 'daisy' | 'epub' | 'pdf') => {
		if (showing === 'epub') {
			setSettingsEpub({
				adjusting,
				adjustment,
				ignoreAside,
				skipPageNumbering,
				parentHighlighting,
			});
		}
		if (showing === 'daisy') {
			setSettingsDaisy({
				adjusting,
				adjustment,
				ignoreAside,
				skipPageNumbering,
				multipleHeaders,
			});
		}
		if (showing === 'pdf') {
			setSettingsPdf({
				skipPageNumbering,
			});
		}
		if (show === 'epub') {
			setAdjusting(settingsEpub.adjusting);
			setAdjustment(settingsEpub.adjustment);
			setIgnoreAside(settingsEpub.ignoreAside);
			setSkipPageNumbering(settingsEpub.skipPageNumbering);
			setParentHighlighting(settingsEpub.parentHighlighting);
		}
		if (show === 'daisy') {
			setAdjusting(settingsDaisy.adjusting);
			setAdjustment(settingsDaisy.adjustment);
			setIgnoreAside(settingsDaisy.ignoreAside);
			setSkipPageNumbering(settingsDaisy.skipPageNumbering);
			setMultipleHeaders(settingsDaisy.multipleHeaders);
		}
		if (show === 'pdf') {
			setSkipPageNumbering(settingsPdf.skipPageNumbering);
		}
		setShowing(show);
		setInputType(show === 'daisy' ? 'daisy' : show === 'pdf' ? 'pdf' : undefined);
	};

	const Description = () => {
		if (showing === 'epub') {
			return (
				<div className='w-full text-center font-semibold'>
					<p>
						Upload an EPUB file that includes audio files, hljodstafir will generate a fully accessible version of the
						book.
					</p>
				</div>
			);
		}
		if (showing === 'daisy') {
			return (
				<div className='w-full text-center font-semibold'>
					<p>
						Upload a Daisy 2.02 book zipped up with audio files, hljodstafir will generate a fully accessible version of
						the book.{' '}
					</p>
				</div>
			);
		}
		if (showing === 'pdf') {
			return (
				<div className='w-full text-center font-semibold'>
					<p>Upload a PDF file, hljodstafir will transform it into an EPUB file. (images currently not supported)</p>
					<ul className='font-thin text-sm mt-2'>
						<li>H1 is any text size 16 or larger, splits the pdf into chapters</li>
						<li>H2 is any text size between 14 and 16</li>
						<li>Any size smaller than 14 is set to be a paragraph</li>
					</ul>
				</div>
			);
		}
		return null;
	};

	return (
		<div className='px-5 my-10 py-4 bg-white rounded-sm flex flex-col w-full max-w-md relative'>
			<div>
				<SwitchButton
					handleClick={() => handleSwitch('epub')}
					showing={showing}
					switchTo={'epub'}
					title={'EPUB'}
					rounded='left'
				/>
				<SwitchButton
					handleClick={() => handleSwitch('daisy')}
					showing={showing}
					switchTo={'daisy'}
					title={'Daisy 2.02'}
					rounded='none'
				/>
				<SwitchButton
					handleClick={() => handleSwitch('pdf')}
					showing={showing}
					switchTo={'pdf'}
					title={'PDF'}
					rounded='right'
				/>
			</div>
			<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>
				Upload {showing === 'epub' ? 'EPUB' : showing === 'daisy' ? 'DAISY 2.02' : 'PDF'}
			</div>
			<Description />
			<div className='w-full flex flex-col py-4 gap-2'>
				<label className='font-medium' htmlFor='selectLanguage'>
					Select Language{' '}
				</label>
				<select
					className='flex border-2 focus:outline-none gap-2 place-items-center place-content-center rounded-sm px-2'
					onChange={(e) => setLanguageCode(e.target.value)}
					id='selectLanguage'
				>
					<option value='isl'>Icelandic</option>
					<option value='dan'>Danish</option>
					<option value='eng'>English</option>
				</select>
				{showing === 'epub' && (
					<div className='p-2 shadow-red'>
						<div className='text-red-700 text-sm underline'>
							<Tooltip text='These features are still in development and may not work as expected. Please notify us of any issues you encounter.'>
								Experimental
							</Tooltip>
						</div>
						<div className='flex flex-col rounded-sm relative milliseconds'>
						<OptionalSetting
								id={'adjusting'}
								label={'Adjust highlighting'}
								tooltip={
									'Highlighting of text will be adjusted by x ms, larger number will make the highlighting occur sooner.'
								}
								settingChecked={adjusting}
								setSettingChecked={setAdjusting}
							/>
							<input
								className='flex border-2 focus:outline-none gap-2 place-items-center place-content-center rounded-sm px-2 pr-8 appearance-none'
								onChange={handleAdjustmentChange}
								value={adjustment}
								type='number'
								id='adjustment'
							/>
						</div>
						<OptionalSetting
							id={'ignoreAside'}
							label={'Ignore Image Text'}
							tooltip={
								'Image text placed inside of &lt;aside&gt; is not read in book and therefore should be ignored by hljóðstafir.'
							}
							settingChecked={ignoreAside}
							setSettingChecked={setIgnoreAside}
						/>
						<OptionalSetting
							id={'skipPageNumbering'}
							label={'Skip numbering pages'}
							tooltip={'Resulting EPUB will not have page numbers.'}
							settingChecked={skipPageNumbering}
							setSettingChecked={setSkipPageNumbering}
						/>
						<OptionalSetting
							id={'parentHighlighting'}
							label={'Sentence & Paragraph Highlighting'}
							tooltip={'Paragraphs are highlighted simultaneously if more than one sentence is present.'}
							settingChecked={parentHighlighting}
							setSettingChecked={setParentHighlighting}
						/>
					</div>
				)}
				{showing === 'daisy' && (
					<div className='p-2 shadow-red'>
						<div className='text-red-700 text-sm underline'>
							<Tooltip text='These features are still in development and may not work as expected. Please notify us of any issues you encounter.'>
								Experimental
							</Tooltip>
						</div>
						<div className='flex flex-col rounded-sm relative milliseconds'>
						<OptionalSetting
								id={'adjusting'}
								label={'Adjust highlighting'}
								tooltip={
									'Highlighting of text will be adjusted by x ms, larger number will make the highlighting occur sooner.'
								}
								settingChecked={adjusting}
								setSettingChecked={setAdjusting}
							/>
							<input
								className='flex border-2 focus:outline-none gap-2 place-items-center place-content-center rounded-sm px-2 pr-8 appearance-none'
								onChange={handleAdjustmentChange}
								value={adjustment}
								type='number'
								id='adjustment'
							/>
						</div>
						<OptionalSetting
							id={'ignoreAside'}
							label={'Ignore Image Text'}
							tooltip={
								'Image text placed inside of &lt;aside&gt; is not read in book and therefore should be ignored by hljóðstafir.'
							}
							settingChecked={ignoreAside}
							setSettingChecked={setIgnoreAside}
						/>
						<OptionalSetting
							id={'skipPageNumbering'}
							label={'Skip numbering pages'}
							tooltip={'Resulting EPUB will not have page numbers.'}
							settingChecked={skipPageNumbering}
							setSettingChecked={setSkipPageNumbering}
						/>
						<OptionalSetting
							id={'multipleHeaders'}
							label={'Segment text by multiple headers'}
							tooltip={'Segment text by multiple headers: H1, H2, H3'}
							settingChecked={multipleHeaders}
							setSettingChecked={setMultipleHeaders}
						/>
					</div>
				)}
				{showing === 'pdf' && (
					<div className='p-2 shadow-red'>
						<div className='text-red-700 text-sm underline'>
							<Tooltip text='These features are still in development and may not work as expected. Please notify us of any issues you encounter.'>
								Experimental
							</Tooltip>
						</div>
						<OptionalSetting
							id={'skipPageNumbering'}
							label={'Skip page-break numbering'}
							tooltip={'Resulting EPUB will not have page-breaks as depicted in the input PDF file.'}
							settingChecked={skipPageNumbering}
							setSettingChecked={setSkipPageNumbering}
						/>
					</div>
				)}
			</div>
			<div className='flex text-sm px-4'>
				<ExclamationMark
					className='bg-primary	flex-none place-self-start justify-self-end text-white rounded-full p-0.5 ml-1'
					size={18}
				/>
				<p className='mb-4 text-left pl-2'>
					By continuing, you acknowledge that you have read, understood, and agree to the{' '}
					<Link href='/terms' className='text-primary font-semibold'>
						terms and conditions.
					</Link>
				</p>
			</div>
			<FileInputButton
				label={showing === 'epub' ? 'Upload EPUB' : showing === 'daisy' ? 'Upload Daisy 2.02' : 'Upload PDF'}
				uploadFileName='files'
				acceptedFileTypes={
					showing === 'epub'
						? 'application/epub+zip'
						: showing === 'daisy'
						? 'application/x-zip-compressed'
						: 'application/pdf'
				}
				onChange={handleFileUpload}
				allowMultipleFiles={false}
			/>
			<LoadingOverlay
				loaderProps={{ size: 'xl', color: '#103b70', variant: 'bars' }}
				overlayOpacity={0.5}
				overlayColor='#a8a29e'
				visible={uploading}
			/>
		</div>
	);
};

export default Uploader;
