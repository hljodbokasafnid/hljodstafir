import React from 'react';
import Tooltip from './Tooltip';
import { QuestionMark } from 'tabler-icons-react';

interface OptionalSettingProps {
	id: string;
	label: string;
	tooltip: string;
	settingChecked: boolean;
	setSettingChecked: (setting: boolean) => void;
}

const OptionalSetting = ({ id, label, tooltip, settingChecked, setSettingChecked }: OptionalSettingProps) => {
	return (
		<div className='flex gap-2 place-items-center rounded-sm'>
			<input
				className='w-4 h-4 accent-primary'
				checked={settingChecked}
				onChange={() => setSettingChecked(!settingChecked)}
				type='checkbox'
				id={id}
			/>
			<label className='flex font-medium' htmlFor={id}>
				{label}
				<Tooltip text={tooltip}>
					<QuestionMark
						className='bg-slate-800 hover:bg-slate-700 text-white place-self-center rounded-full p-0.5 ml-1'
						size={18}
					/>
				</Tooltip>
			</label>
		</div>
	);
};

export default OptionalSetting;
