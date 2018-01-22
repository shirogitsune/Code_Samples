import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.io.*;
import java.util.zip.DataFormatException;
//Java 7 Base64 compatibility
import com.sun.xml.internal.messaging.saaj.util.Base64;

/**
 * AkamaiCCUCacheRequest
 * @author jpearce
 * This class acts as an interface to the Akamai CCU REST API. The REST API uses Basic HTTP 
 * authentication to authenticate users on each request and uses the "application/json" MIME type
 * for it's messaging. Errors returned by the API are of MIME type "application/problem+json" as 
 * opposed to hard error messages. Because the message content is very simple JSON, we use simple 
 * string parsing and a basic helper (ccuResponse) class as opposed to implementing a JSON class library.
 * 
 */
public class AkamaiCCUCacheRequest {
	AkamaiCCUCacheRequest() {
		this.queuedItems = new ArrayList<String>();
	}
	AkamaiCCUCacheRequest(String username, String password) {
		this.ccuUsername = username;
		this.ccuPassword = password;
		this.queuedItems = new ArrayList<String>();
	}
	/**
	 * setUsername
	 * This function sets the class member variable for holding the username to the input value
	 *
	 * @param String username
	 * @return None
	 */
	public void setUsername(String uname) {
		this.ccuUsername = uname;
	}
	/**
	 * setPassword
	 * This function sets the class member variable for holding the password to the input value
	 *
	 * @param String password
	 * @return None
	 */
	public void setPassword(String pword) {
		this.ccuPassword = pword;
	}
	/**
	 * queueItemsToPurge
	 * This function receives an array of Strings and appends them to an internal list.
	 * The function throws a DataFormatException of the number of requested entities goes over 
	 * the 10000 item limit imposed by the Luna API.
	 *
	 * @param Array of type String
	 * @return int of items added
	 */
	public int queueItemsToPurge(String[] items) throws DataFormatException {
		int i = 0;
		if (items.length > MAX_QUEUE_SIZE){
			throw new DataFormatException("Luna API limits requests to " + MAX_QUEUE_SIZE + " items at a time");
		}
		for (i = 0; i < items.length; i++){
			this.queuedItems.add(items[i]);
		}
		return i;
	}
	/**
	 * queueItemsToPurge
	 * This function receives an array of Strings and appends them to an internal list.
	 * The function throws a DataFormatException of the number of requested entities goes over 
	 * the 10000 item limit imposed by the Luna API.
	 *
	 * @param Collection object of items to be queued
	 * @return int of items added
	 */
	public int queueItemsToPurge(Collection<String> items) throws DataFormatException {
		if (items.size() > MAX_QUEUE_SIZE){
			throw new DataFormatException("Luna API limits requests to " + MAX_QUEUE_SIZE + " items at a time");	
		}
		try{
			this.queuedItems.addAll(this.queuedItems.size(), items);
			return items.size();
		} catch(NullPointerException exception) {
			return 0;
		}
	}
	/**
	 * submitPurgeRequest
	 * This function submits a purge request to the Akamai CCU REST API
	 * This uses all of the default settings and posts the request to the default queue
	 * 
	 * @param None
	 * @return boolean success
	 */
	public boolean submitPurgeRequest(){
		return this.submitPurgeRequest("default", this.purgeType, this.purgeAction, this.purgeDomain);
	}
	/**
	 * submitPurgeRequest
	 * This function submits a purge request to the Akamai CCU REST API
	 * 
	 * @param String queue
	 * @return boolean success
	 */
	public boolean submitPurgeRequest(String queue){
		return this.submitPurgeRequest(queue, this.purgeType, this.purgeAction, this.purgeDomain);
	}
	/**
	 * submitPurgeRequest
	 * This function submits a purge request to the Akamai CCU REST API
	 * 
	 * @param String queue, String type
	 * @return boolean success
	 */
	public boolean submitPurgeRequest(String queue, String type){
		return this.submitPurgeRequest(queue, type, this.purgeAction, this.purgeDomain);
	}
	/**
	 * submitPurgeRequest
	 * This function submits a purge request to the Akamai CCU REST API
	 * 
	 * @param String queue, String type, String action
	 * @return boolean success
	 */
	public boolean submitPurgeRequest(String queue, String type, String action){
		return this.submitPurgeRequest(queue, type, action, this.purgeDomain);
	}
	/**
	 * submitPurgeRequest
	 * This function submits a purge request to the Akamai CCU REST API
	 * 
	 * @param String queue, String type, String action, String domain
	 * @return boolean success
	 */
	public boolean submitPurgeRequest(String queue, String type, String action, String domain){
		StringBuffer requestBody;
		ccuResponse parsedResponse; 
		
		//Ensure that certain values fall within normal parameters
		this.purgeType = (type.equalsIgnoreCase("arl") || type.equalsIgnoreCase("cpcode")) ? type : "arl";
		this.purgeAction = (action.equalsIgnoreCase("invalidate") || action.equalsIgnoreCase("remove")) ? action : "remove";
		this.purgeDomain = (domain.equalsIgnoreCase("production") || domain.equalsIgnoreCase("staging")) ? domain : "production";		
		
		try{
			//Build out the body of the request.
			requestBody = this.buildRequestBody();
			
		} catch(DataFormatException exception) {
			return false;	
		}
		try{
			//Post the request to the API process it's response.
			parsedResponse = postRequest(queue, requestBody.toString(), false);
			this.progressUri = parsedResponse.progressUri;
			this.currentPurgeStatus = parsedResponse.purgeStatus;
			this.purgeId = parsedResponse.purgeId;
			this.supportId = parsedResponse.supportId;
			this.pingInterval = parsedResponse.pingAfterSeconds;
			this.timeToComplete = parsedResponse.estimatedSeconds;
			
			//Set a status message in case something goes wrong.
			if (parsedResponse.httpStatus < 300) {
				this.statusMessage = parsedResponse.detail;
			} else {
				this.statusMessage = parsedResponse.title + ": " + parsedResponse.detail;
			}
			
			return true;
			
		}catch(Exception exception){
			return false;
		}
	}
	/**
	 * getQueueLength
	 * This function submits a request to the API for the length of the desired queue
	 * 
	 * @param String queue
	 * @returns int items in queue
	 */
	public int getQueueLength(String queue){
		try{
			ccuResponse queueLengthResponse = this.postRequest(queue, "", false);
			this.statusMessage = queueLengthResponse.detail;
			return queueLengthResponse.originalQueueLength;
		}catch(Exception exception){
			return -1;
		}
	}
	/**
	 * getStatusUpdate
	 * This function updates the request status fields
	 *
	 * @param None
	 * @return boolean success
	 */
	public boolean getStatusUpdate(String queue){
		try{
			//Get status update from API
			ccuResponse statusUpdateResponse = this.postRequest(queue, "", true);
			//Update status fields
			this.currentPurgeStatus = statusUpdateResponse.purgeStatus;
			this.statusMessage = statusUpdateResponse.purgeStatus + ", Submitted: " + statusUpdateResponse.submissionTime;
			this.purgeId = statusUpdateResponse.purgeId;
			this.supportId = statusUpdateResponse.supportId;
			this.pingInterval = statusUpdateResponse.pingAfterSeconds;
			if(statusUpdateResponse.originalEstimatedSeconds != this.timeToComplete){
				this.timeToComplete = statusUpdateResponse.originalEstimatedSeconds;
			}

			return true;
		}catch(Exception exception){
			return false;
		}
	}
	/**
	 * buildRequestBody
	 * This function builds out the JSON formatted request string for purging items.
	 *
	 * @param None
	 * @return StringBuffer json object
	 */
	private StringBuffer buildRequestBody() throws DataFormatException{
		StringBuffer requestBody = new StringBuffer("{");
		
		requestBody.append("\"type\":\"" + this.purgeType + "\",");
		requestBody.append("\"action\":\"" + this.purgeAction + "\",");
		requestBody.append("\"domain\":\"" + this.purgeDomain + "\",");
		try{
			requestBody.append("\"objects\":" + this.buildPurgeObjectsList() + "");
		} catch(DataFormatException exception) {
			throw new DataFormatException("There was an error building the request body. The error was as follows: " + exception.getMessage());
		}
		
		requestBody.append("}");
		return requestBody;
	}
	/**
	 * buildPurgeObjectsList
	 * This function builds out the JSON formatted array of items to be purged.
	 *
	 * @param None
	 * @return StringBuilder json array
	 */
	private StringBuffer buildPurgeObjectsList() throws DataFormatException{
		if (this.queuedItems.size() < MIN_QUEUE_SIZE) {
			throw new DataFormatException("Request specified with an empty set of items");
		} else if (this.queuedItems.size() > MAX_QUEUE_SIZE) {
			throw new DataFormatException("Request specified with too many items (> " + MAX_QUEUE_SIZE + ")");
		}
		Iterator<String> queuedItemsList = this.queuedItems.iterator();
		StringBuffer objectsList = new StringBuffer("[");
		while(queuedItemsList.hasNext()){
			objectsList.append("\""+queuedItemsList.next()+"\",");
		}
		objectsList.setCharAt(objectsList.lastIndexOf(","), ']');
		return objectsList;
	}
	/**
	 * postRequest
	 * This function posts requests to the Akamai CCU API
	 * 
	 * @param String queue, String jsonRequestBody, boolean getProgress
	 * @return ccuResponse parsedResponse
	 */
	private ccuResponse postRequest(String queue, String requestBody, boolean getProgress) throws Exception{
		URL requestUrl;
		HttpURLConnection ccuConnection;
		StringBuffer incomingRequestContainer = new StringBuffer();
		
		//Determine which queue to use
		if (!getProgress){
			if (queue.equals("emergency")) {
				requestUrl = new URL(ENDPOINT_URL + "" + EMERGENCY_QUEUE_PATH);
			} else {
				requestUrl = new URL(ENDPOINT_URL + "" + DEFAULT_QUEUE_PATH);
			}
		} else {
			if (!this.progressUri.equals("")){
				requestUrl = new URL(ENDPOINT_URL + "" + this.progressUri);
			}else{
				throw new IOException("ProgressUri not specified");
			}
		}
		
		//Setup the connection to the REST API
		ccuConnection = (HttpURLConnection) requestUrl.openConnection();
		//If we have a request body to send, we will use the POST method. Otherwise use GET method.
		if (!requestBody.equals("")) {
			ccuConnection.setRequestMethod("POST");
			ccuConnection.setDoInput(true);
		}else{
			ccuConnection.setRequestMethod("GET");
		}

		ccuConnection.setDoOutput(true);
		ccuConnection.setUseCaches(false);
		ccuConnection.setAllowUserInteraction(false);
		
		//Password authentication against the API
		String authString = this.ccuUsername + ":" + this.ccuPassword;
		//If we're compiling against the Java 8, we need to use the new API in java.util for Base64 encoding
		//Base64.Encoder base64Encoder = Base64.getEncoder();
		//byte[] authStringBytes = base64Encoder.encodeToString(authString.getBytes()).getBytes();
		
		//Otherwise we need to use the Java 7 methods
		byte[] authStringBytes = Base64.encode(authString.getBytes());
		String encodedAuthString = new String(authStringBytes);
		ccuConnection.setRequestProperty("Authorization", "Basic " + encodedAuthString);
		
		//If the request body is set, send out the request
		if (!requestBody.equals("")) {
			//Akamai requests should be JSON formatted
			ccuConnection.setRequestProperty("Content-Type", "application/json");
			//Submit the request to the API for queuing
			OutputStream outgoingPipe = ccuConnection.getOutputStream();
			Writer outgoingRequestWriter = new OutputStreamWriter(outgoingPipe, "UTF-8");
			outgoingRequestWriter.write(requestBody);
			outgoingRequestWriter.close();
			outgoingPipe.close();
		}
		
		//Get the content type of the reply
		switch (ccuConnection.getContentType()) {
			//These two are the special JSON returned by the API for either a success or
			//command error
			case "application/json":
			case "application/api-problem+json":
				//Read in the content from the server
				BufferedReader incomingPipe = new BufferedReader(new InputStreamReader(ccuConnection.getInputStream()));
				String incomingLine;
				while ( (incomingLine = incomingPipe.readLine()) != null) {
					incomingRequestContainer.append(incomingLine);
				}
				incomingPipe.close();
				break;
			//This takes care of all the other replies that might come into play
			default:
				//Figure out of this an HTTP error
				if (ccuConnection.getResponseCode() != 200) {
					throw new IOException(ccuConnection.getResponseMessage());
				} else { //Or something else
					incomingRequestContainer.append("{\"httpStatus\":" + ccuConnection.getResponseCode() + ", "
												+"\"title\":\"unknown error\", "
												+"\"detail\":\"The api replied in an unexpected/undefined way.\"}");
				    
				}
				break;
		}
		
		//Close the connection to the API
		ccuConnection.disconnect();
		//Parse the response and return it.
		return this.parseCCUResponse(incomingRequestContainer.toString());
	}
	/**
	 * parseCCUResponse
	 * This function convert the raw JSON formatted response into a ccuResponse utility 
	 * object for consumption by the rest of the class
	 *
	 * @param String rawResponse
	 * @return ccuResponse parsedResponse
	 */
	private ccuResponse parseCCUResponse(String rawResponse){
		ccuResponse parsedResponse = new ccuResponse();
		String[] responseSections;
		String[] keyValuePair;
		
		//Since the reply is very basic JSON, we can just chop it up into pieces
		rawResponse = rawResponse.replace("{", "").replace("}", "").replace("\n", "").trim();
		responseSections = rawResponse.split(",");
		for (int i = 0; i<responseSections.length; i++) {
			responseSections[i] = responseSections[i].trim();
			if (!responseSections[i].equals("")) {
				//and more pieces...
				responseSections[i] = responseSections[i].replace("\"", "");
				keyValuePair = responseSections[i].split(":", 2);
				//and push them into our utility object
				parsedResponse.setField(keyValuePair[0].trim(), keyValuePair[1].trim());
			}
		}
		
		return parsedResponse;
	}
	/**
	 * Public Member Variables
	 */
	public String currentPurgeStatus = "";
	public String statusMessage = "";
	public String purgeId = "";
	public String supportId = "";
	public int pingInterval = 0;
	public int timeToComplete = 0;
	/**
	 * Private Member Variables
	 */
	private String purgeType = "arl";
	private String purgeAction = "remove";
	private String purgeDomain = "production";
	private String progressUri = "";
	private String ccuUsername = "";
	private String ccuPassword = "";
	private ArrayList<String> queuedItems;
	/**
	 * Constants
	 */
	private static final String ENDPOINT_URL = "https://api.ccu.akamai.com";
	private static final String DEFAULT_QUEUE_PATH = "/ccu/v2/queues/default";
	private static final String EMERGENCY_QUEUE_PATH = "/ccu/v2/queues/emergency";
	private static final int MAX_QUEUE_SIZE = 100; //Akamai CCU Maximum queue size
	private static final int MIN_QUEUE_SIZE = 1;
}
/**
 * ccuResponse
 *  
 * Since we are not using a JSON parser to handle the data coming back from the server
 * we need a utility class to house the data that's returned. 
 *  
 */
class ccuResponse{
	/**
	 * setField
	 * This function takes a string key and string value to set the fields of the request
	 * object
	 * 
	 * @param String key, String value
	 * @return None
	 */
	public void setField(String key, String value){
		switch (key) {
			case "httpStatus":
				this.httpStatus = Integer.parseInt(value, 10);
				break;
			case "estimatedSeconds":
				this.estimatedSeconds = Integer.parseInt(value, 10);
				break;
			case "originalEstimatedSeconds":
				this.originalEstimatedSeconds = Integer.parseInt(value, 10);
				break;
			case "pingAfterSeconds":
				this.pingAfterSeconds = Integer.parseInt(value, 10);
				break;
			case "originalQueueLength":
				this.originalQueueLength = Integer.parseInt(value, 10);
				break;
			case "supportId":
				this.supportId = value;
				break;
			case "title":
				this.title = value;
				break;
			case "detail":
				this.detail = value;
				break;
			case "describedBy":
				this.describedBy = value;
				break;
			case "purgeId":
				this.purgeId = value;
				break;
			case "purgeStatus":
				this.purgeStatus = value;
				break;
			case "submittedBy":
				this.submittedBy = value;
				break;
			case "progressUri":
				this.progressUri = value;
				break;
			case "submissionTime":
				this.submissionTime = value;
				break;
			case "completionTime":
				this.completionTime = value;
				break;
		}
	}
	public int httpStatus = 0;
	public int estimatedSeconds = 0;
	public int originalEstimatedSeconds = 0;
	public int pingAfterSeconds = 0;
	public int originalQueueLength = 0;
	public String supportId = "";
	public String title = "";
	public String detail = "";
	public String describedBy = "";
	public String purgeId = "";
	public String purgeStatus = "";
	public String submittedBy = "";
	public String progressUri = "";
	public String submissionTime = "";
	public String completionTime = "";
}