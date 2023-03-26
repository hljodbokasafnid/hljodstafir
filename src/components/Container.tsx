import React, { ReactNode } from 'react';
import Navbar from './navigation/Navbar';

const Container = ({ userRole, children }: { userRole?: string, children: ReactNode }) => {
	return (
		<div className='flex flex-col min-h-screen mx-auto'>
			<Navbar userRole={userRole} />
			{children}
		</div>
	);
};

export default Container;
