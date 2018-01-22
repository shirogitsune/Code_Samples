import java.io.*;
import java.util.*;
/**
 * AkamaiCCUControl
 * @author jpearce
 * This is a sample implementation of the AkamaiCCUCacheRequest class.
 *
 */
public class AkamaiCCUControl{
	public static void main(String[] args) {
		final AkamaiCCUCacheRequest cacheRequest = new AkamaiCCUCacheRequest();
		ArrayList<String> arlListContainer = new ArrayList<String>();
		BufferedReader arlBufferedReader = null;
		String queue = "";
		String arlLineItem = "";
		String workingDirectory = System.getProperty("user.dir");
		
		if(args.length != 3){
			System.out.println("\nUsage: AkamaiCCUControl username password queuename");
			System.out.println("       The program will look for ARLs in the arls.txt file in this directory.");
			return;
		}else{
			cacheRequest.setUsername(args[0]);
			cacheRequest.setPassword(args[1]);
			queue = args[2];
			try{
				arlBufferedReader = new BufferedReader(new FileReader(workingDirectory + "\\arls.txt"));
				while ((arlLineItem = arlBufferedReader.readLine()) != null) {
					arlListContainer.add(arlLineItem);
				}
				cacheRequest.queueItemsToPurge(arlListContainer);
				arlBufferedReader.close();
				if( cacheRequest.submitPurgeRequest(queue) ){
					System.out.println("[SUCCESS] " + cacheRequest.statusMessage + ": " + cacheRequest.purgeId);
					System.out.println("[INFO] Estimated Time To Complete: " + (cacheRequest.timeToComplete/60) + " minutes" );
					Thread cacheCheck = new Thread(new Runnable(){
						public void run(){
							long requestStartTimeInMillis = System.currentTimeMillis();
							while(!cacheRequest.currentPurgeStatus.equals("Done")){
								//System.out.println("[INFO] Checking request status in " + cacheRequest.pingInterval + " seconds");
								System.out.println("[INFO] Checking request status in 60 seconds");
								try {
									Thread.sleep(60 * 1000);
								} catch (InterruptedException e) {
									Thread.currentThread().interrupt();
								}
								if(cacheRequest.getStatusUpdate("default")){
									System.out.println("[INFO] Request Status: " + cacheRequest.currentPurgeStatus);
									if(!cacheRequest.currentPurgeStatus.equals("Done")){
										System.out.println("[INFO] Estimated Time To Complete: " + (((((long)cacheRequest.timeToComplete * 1000) - (System.currentTimeMillis() - requestStartTimeInMillis)) / 1000) / 60) + " minutes" );
									}
								}
							}
							System.out.println("[SUCCESS] Cache Clear Request Complete!");
						}
					});
					cacheCheck.start();

				} else {
					System.out.println("[ERROR] " + cacheRequest.statusMessage);
				}
				
			}catch(Exception ex){
				System.out.println("[ERROR] An Error occurred: " + ex.getMessage());
				System.out.println("\nUsage: AkamaiCCUControl username password queuename");
				System.out.println("       The program will look for ARLs in the arls.txt file in this directory.");
				return;
			}
			
			return;
		
		}
	}
}