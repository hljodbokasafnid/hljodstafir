import { Blockquote, Timeline } from '@mantine/core';
import { Check, X, ExclamationMark } from 'tabler-icons-react';
import { ISocketMessage } from '../interfaces';

export interface MessagesProps {
	messages: ISocketMessage[];
	canCloseMessages: boolean;
	handleCloseFeed: () => void;
	stopProcess: () => void;
}

const Messages = ({
	messages,
	canCloseMessages,
	handleCloseFeed,
	stopProcess,
}: MessagesProps) => {
	if (messages.length === 0) {
		return <></>;
	}
	return (
		<div className='my-8 pt-2 w-full rounded-none lg:w-1/2 h-half-screen bg-white lg:rounded-sm flex flex-col relative'>
			<button
				onClick={handleCloseFeed}
				className={`${
					canCloseMessages ? 'absolute' : 'hidden'
				} top-2.5 right-3 text-red-600 hover:text-red-400 text-xl font-black`}
			>
				⨉
			</button>
			<div className='w-full text-center font-semibold text-2xl mb-2'>Feed</div>
			<div className='flex flex-col w-full p-4 bg-gray-200 h-half-screen rounded-sm overflow-y-auto'>
				<Timeline active={messages.length} bulletSize={30} lineWidth={2}>
					{messages
						.sort((a, b) => new Date(b.delivered).getTime() - new Date(a.delivered).getTime())
						.map((message, idx) => {
							const messageLines = message.message.split('\r\n');
							return (
								<Timeline.Item
									key={idx}
									bullet={
										message.highlight === 'warning' ? (
											<ExclamationMark />
										) : message.highlight === 'error' ? (
											<X />
										) : (
											<Check />
										)
									}
									color={
										message.message.includes('Finished')
											? 'green'
											: message.highlight === 'warning'
											? 'yellow'
											: message.highlight === 'error'
											? 'red'
											: 'blue'
									}
									title={new Date(message.delivered).toLocaleString('en-GB').replace(',', '')}
								>
									<Blockquote className='prose-lg' cite={null} icon={null}>
										{messageLines.map((line, messageIndex) => {
											return <div key={messageIndex} className=''>{line}</div>;
										})}
									</Blockquote>
								</Timeline.Item>
							);
						})}
				</Timeline>
			</div>
		</div>
	);
};

export default Messages;
