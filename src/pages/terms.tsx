import React from 'react';
import Container from '../components/Container';

const Terms = () => {
	const [date, setDate] = React.useState<string | undefined>(undefined);

	const LAST_UPDATED = '2023-03-28';

	React.useEffect(() => {
		const date = new Date(LAST_UPDATED);
		const formattedDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(date);
		setDate(formattedDate);
	}, []);

	return (
		<Container>
			<div className='relative h-full flex flex-col mb-auto min-h-[calc(100vh-5rem)] m-8 prose max-w-none'>
				{date && (
					<div className='bg-primary text-white rounded-md p-2 mb-8 w-min min-w-fit font-mono font-bold place-self-end'>
						{date}
					</div>
				)}
				<h1>Terms and Conditions Agreement</h1>
				<p>
					This terms and conditions ("Agreement") governs your use of our website and services. By accessing or using our
					website and services, you agree to be bound by this Agreement. If you do not agree to this Agreement, you may
					not access or use our website and services.
				</p>

				<h2>Description of Services</h2>
				<p>
					Our website provides users with access to [insert description of services]. We may also offer additional
					services from time to time. You are responsible for obtaining access to our website and services, and for all
					equipment necessary to access and use our website and services.
				</p>

				<h2>User Conduct</h2>
				<p>
					You agree to use our website and services only for lawful purposes and in accordance with this Agreement. You
					agree not to use our website and services:
				</p>
				<ul>
					<li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
					<li>
						To transmit, or procure the sending of, any advertising or promotional material without our prior written
						consent.
					</li>
					<li>
						To impersonate or attempt to impersonate us, our employees, another user, or any other person or entity.
					</li>
					<li>
						To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of our website and
						services, or which, as determined by us, may harm us or users of our website and services, or expose them to
						liability.
					</li>
				</ul>
				<h2>Intellectual Property</h2>
				<p>
					Our website and services contain proprietary information that is protected by copyright, trademark, and other
					intellectual property laws. You may not modify, publish, transmit, participate in the transfer or sale of,
					create derivative works from, distribute, display, reproduce, or in any way exploit in any format whatsoever
					any of the content of our website and services.
				</p>

				<h2>Disclaimer of Warranties</h2>
				<p>
					Our website and services are provided on an "as is" and "as available" basis. We do not warrant that our
					website and services will be uninterrupted, error-free, or free of viruses or other harmful components.
				</p>

				<h2>Limitation of Liability</h2>
				<p>
					We shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages,
					including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses,
					resulting from your access to or use of our website and services.
				</p>

				<h2>Indemnification</h2>
				<p>
					You agree to defend, indemnify, and hold us harmless from any and all claims, liabilities, damages, and
					expenses, including reasonable attorneys' fees and costs, arising out of or in any way connected with your
					access to or use of our website and services.
				</p>

				<h2>Governing Law</h2>
				<p>
					This Agreement shall be governed by and construed in accordance with the laws of [insert governing law],
					without giving effect to any principles of conflicts of law.
				</p>

				<h2>Changes to this Agreement</h2>
				<p>
					We may modify this Agreement from time to time. Any such modification will be effective immediately upon
					posting on our website. Your continued use of our website and services following any such modification
					constitutes your acceptance of the modified Agreement.
				</p>

				<h2>Termination</h2>
				<p>
					We may terminate your access to our website and services at any time, with or without cause, with or without
					notice, effective immediately.
				</p>

				<h2>Miscellaneous</h2>
				<p>
					This Agreement constitutes the entire agreement between you and us with respect to the subject matter hereof
					and supersedes all prior oral or written agreements, understandings, or representations between you and us. If
					any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall
					continue to be valid and enforceable. Our failure to enforce any right or provision in this Agreement shall
					not constitute a waiver of such right or provision unless acknowledged and agreed to by us in writing.
				</p>
			</div>
		</Container>
	);
};

export default Terms;
