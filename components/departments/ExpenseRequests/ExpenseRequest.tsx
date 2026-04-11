import SummaryContainer from '@/components/departments/ExpenseRequests/SummaryContainer';
import RequestForm from '@/components/departments/ExpenseRequests/RequestForm';
import RequestList from '@/components/departments/ExpenseRequests/RequestList';

export default function ExpenseRequest() {
  return (
    <div className="p-4">
      <SummaryContainer />
      <div className="flex gap-6 mt-6">
        <div className="flex-2">
          <RequestForm />
        </div>
        <div className="flex-1">
          <RequestList />
        </div>
      </div>
    </div>
  );
}
