import { PatientLayout } from '@/components/patient/patient-layout'
import PrescriptionParser from '../../../components/PrescriptionParser'

export const metadata = {
	title: 'Transcribe Prescription',
}

export default function Page() {
	return (
		<PatientLayout>
			<h1 className="text-2xl text-center font-bold mb-4">Transcribe Handwritten Prescription</h1>
			<PrescriptionParser />
		</PatientLayout>
	)
}
