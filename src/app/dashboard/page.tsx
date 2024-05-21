import Dashboard from '@/component/Dashboard';
import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();  // Correctly awaiting the promise

  // Check if the user is null or undefined, or if user.id is missing
  if (!user || !user.id) {
    redirect('/auth-callback?origin=dashboard');
    return null;  // Exiting the function to avoid further execution
  }

  // Query the database to find the user
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  });

  if (!dbUser) {
    redirect('/auth-callback?origin=dashboard');
    return null;  
  }

  
  return <Dashboard />;
};

export default Page;
