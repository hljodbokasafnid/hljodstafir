import React, { ReactNode } from 'react';
import Navbar from './navigation/Navbar';

const Container = ({ children }: { children: ReactNode }) => {
	return (
		<div className='flex flex-col min-h-screen mx-auto'>
			<Navbar />
			{children}
		</div>
	);
};

export default Container;
