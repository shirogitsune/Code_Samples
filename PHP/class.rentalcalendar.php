<?php
/* Requires: Database */
require_once('class.database.php');

/* Class RentalCalendar
 * The class also provides basic date/time functions for simplifying date/time
 * calls and requests.
 * By: Justin Pearce on 1/16/2008
 */
class RentalCalendar{

var $DB;
var $caldbhost;
var $caldbuser;
var $caldbpass;
var $caldbdb;

var $rowcount;
var $colcount;
var $rentals;

var $unitsRented;
var $availableInInterval;

/* Function RentalCalendar()
 * This function acts as constructor for the class object of the same name.
 * @Args: None
 * @Returns: None
 */
function RentalCalendar(){
    include('./config.php');
    $this->caldbhost=$DBHOST;
    $this->caldbuser=$DBUSER;
    $this->caldbpass=$DBPASS;
    $this->caldbdb=$DBNAME;
    $this->DB=new Database($this->caldbhost, $this->caldbuser, $this->caldbpass, $this->caldbdb);
    register_shutdown_function(array(&$this, 'closeCal'));
}

/* Function: buildCalendar()
 * This function builds a calendar of dates for a given interval and date
 * @Args: string date, integer interval
 * @Returns: string Calendar
 */
function buildCalendar($date, $interval=7){
    include('./config.php');

    /* Ensure the date is formatted as needed */
    if($date==""){
        $date=time();
    }

    if(isset($_SESSION['aligndate']) && $_SESSION['aligndate']=='left'){
        //$date = mktime(date('H', $date), date('i', $date), date('s', $date), date('n', $date), (date('j', $date)+floor($interval/2)), date('Y', $date));
        $dateStamp = strtotime($date);
        $dateStamp = mktime(date('H', $dateStamp), date('i', $dateStamp), date('s', $dateStamp), date('n', $dateStamp), (date('j', $dateStamp)+$interval), date('Y', $dateStamp));
        $centerdate = explode('-', date('Y-m-d', $dateStamp));
    } else {
        $centerdate = explode('-', date('Y-m-d', strtotime($date)));
    }

    /* Make a date for the start and end of our interval. */
    $startinterval=date('Y-m-d', mktime(0,0,0, $centerdate[1], (intval($centerdate[2]) - intval($interval)), $centerdate[0]));
    $endinterval=date('Y-m-d', mktime(0,0,0, $centerdate[1], (intval($centerdate[2]) + intval($interval)), $centerdate[0]));
    /* Make an array out of the bits for our start interval (We'll use this
      for comparison with the dates in the rental_calendar entries as well
      as for a key for our 'calendar') */
    $datemarker = explode('-', $startinterval);
    $dateender = explode('-', $endinterval);
    $holidays = array();
    if($datemarker[0]!=$dateender[0]){
        $holidays = array_merge($this->defineHolidays($datemarker[0]), $this->defineHolidays($dateender[0]));
    }else{
        $holidays = $this->defineHolidays($datemarker[0]);
    }
    $events = array();
    if($datemarker[0]!=$dateender[0]){
        $events = array_merge($this->defineEvents($datemarker[0]), $this->defineEvents($dateender[0]));
    }else{
        $events = $this->defineEvents($datemarker[0]);
    }
    /* Make the calendar */
    $calendar = array();
    $colorarray=array();
    $currentdate='';
    /* Build a calendar of days over the period of the invertval */
    for($i=0; $i<(($interval*2)+1); $i++){ //<- (Interval*2)+1 to cover the day they searched and interval before and after that day
        /* Our current date gets set to the start of the interval and steps through day by day */
        $currentdate=date('Y-m-d', mktime(0, 0, 0, $datemarker[1], ($datemarker[2]+$i), $datemarker[0]));
        /* Shove the schedule into the labeled date */
        $calendar[$currentdate]=1;
    }

    /* Run through the calendar and generate the HTML */
    $b=1;
    /* calendarDiv holds everything */
    //$calendarDiv='<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0px; padding:0px; border:0px;">'."\n";
    $calendarDiv='';
    /* calendarDays will hold the days names*/
    $calendarDaysNames="<tr>";
    /* calendarDays will hold the days */
    $calendarDays="<tr>";
    /* yearsDiv holds the individual years */
    $yearsDiv='<tr>';
    /* monthsDiv holds the individual months */
    $monthsDiv='<tr>';
    $currmonth='';
    $prevmonth='';
    $curryear='';
    $prevyear='';
    /* Loop though the Calendar we built*/
    foreach($calendar as $k => $v){
        /* If the month is not equal to the current month... */
        if($currmonth!=date('n', strtotime($k))){
           $currmonth=date('n', strtotime($k)); //Set current to new
           $prevmonth=$k; //Set previous to new for placeholder and create the new month div
           $monthsDiv.='<td id="'.date('FY', strtotime($prevmonth)).'" width="'.floor((75/(($interval*2)+1))).'%" '
           .'style="font-size: 14px; border-left: 1px solid #000000;"><div style="overflow: hidden; font-weight: bold;">'.date('M', strtotime($prevmonth)).'</div></td>'."\n";
        }else{// Insert a blank
           $monthsDiv.='<td id="'.date('FY', strtotime($prevmonth)).'" width="'.floor((75/(($interval*2)+1))).'%" style="font-size: 14px;">&nbsp;</td>'."\n";
        }
        /* If the year is not equal to the current year... */
        if($curryear!=date('Y', strtotime($k))){
           $curryear=date('Y', strtotime($k)); //Set current to new
           $prevyear=$k;//Set previous to new for placeholder and create new month div
           $yearsDiv.='<td id="'.date('Y', strtotime($prevyear)).'" width="'.floor((75/(($interval*2)+1))).'%" '
           .'style="font-size: 10px; border-left: 1px solid #000000;"><div style="overflow: hidden; font-weight: bold;">'.date('Y', strtotime($prevyear)).'</div></td>'."\n";
        }else{// Insert a blank
           $yearsDiv.='<td id="'.date('Y', strtotime($prevyear)).'" width="'.floor((75/(($interval*2)+1))).'%" '
           .'border: 1px solid transparent; style="font-size: 10px;">&nbsp;</td>'."\n";
        }
        $calendarDaysNames.='<td width="'.floor((75/(($interval*2)+1))).'%" '
                          .'style="border: 1px solid #000000; background-color: ';
                      /* Get an array of parts for this date */
                      $weekendCheck=getdate(strtotime($k));
                      /* If this day is not either Sunday or Saturday */
                      if($weekendCheck['wday']!=0 && $weekendCheck['wday']!=6){
                          $thisHighlight = '#FFFFFF'; //Apply a white background
                          $ev='';
                      }else{
                          $thisHighlight = $WEEKEND_HIGHLIGHT; //Apply the weekend highlight
                          $ev='';
                      }
                      /* If this is the 'center date' */
                      if($b==($interval+1)){
                          $thisHighlight = $CENTERDATE_HIGHLIGHT; //Apply the 'center date' highlight
                          $ev='';
                      }
                      if($v=$this->search_holidays(strtotime($k), $holidays)){
                          $thisHighlight = $HOLIDAY_HIGHLIGHT;
                          $ev='<br><span style="font-size:9px;">'.$holidays[$v]['name'].'</span>';
                      }
                      if($v=$this->search_events($k, $events, -1, false)){
                          $e=$this->select_events($k, $events, -1, false);
                          $thisHighlight = $EVENT_HIGHLIGHT;
                          $ev='<br><span style="font-size:9px;">'.$e->event_name.'</span>';
                      }
        /* Complete the rest of the div */
        $calendarDaysNames.=$thisHighlight.'; text-align: center;">'."\n"
                      .'<div style="overflow: hidden; margin: 0px; padding: 0px; width: 100%;"><b>'.date('D', strtotime($k)).$ev.'</b></div>'."\n";
        $calendarDaysNames.='</td>'."\n";
        /* Build each of the calendarDays */
        $calendarDays.='<td ' //width="'.floor((100/(($interval*2)+1))).'%" '
                      .'style="border: 1px solid #000000; border-bottom: 2px solid #000000; background-color: ';
                      /* Get an array of parts for this date */
                      $weekendCheck=getdate(strtotime($k));
                      /* If this day is not either Sunday or Saturday */
                      if($weekendCheck['wday']!=0 && $weekendCheck['wday']!=6){
                          $thisHighlight = '#FFFFFF'; //Apply a white background
                      }else{
                          $thisHighlight = $WEEKEND_HIGHLIGHT; //Apply the weekend highlight
                      }
                      /* If this is the 'center date' */
                      if($b==($interval+1)){
                          $thisHighlight = $CENTERDATE_HIGHLIGHT; //Apply the 'center date' highlight
                      }
                      if($v=$this->search_holidays(strtotime($k), $holidays)){
                          $thisHighlight = $HOLIDAY_HIGHLIGHT;
                      }
                      if($v=$this->search_events($k, $events, -1, false)){
                          $thisHighlight = $EVENT_HIGHLIGHT;
                      }
        /* Complete the rest of the div */
        $calendarDays.=$thisHighlight.'; text-align: center;">'."\n"
                      .'<div style="margin: 0px; padding: 0px; min-width: 15px;">'.date('d', strtotime($k)).'</div>'."\n";
        $calendarDays.='</td>'."\n";
        $b++; //<- Increment our counter for where in the interval we're at
    }
    /* Putting it all together... */
    //$calendarHTML.=$calendarDiv.$yearsDiv.$monthsDiv.'</div>'."\n".$calendarDays.'</div>'."\n";
    $calendarHTML.=$calendarDiv.$yearsDiv.'</tr>'."\n".$monthsDiv.'</tr>'."\n".$calendarDaysNames.'</tr>'."\n".$calendarDays.'</tr>'."\n";//</table>'."\n";
    return $calendarHTML; //<- Return completed HTML calendar
}

/* Function: buildCalendarByProperty()
 * Given an integer property id, the function seeks all entries in the
 * rental_calendar table that have a start or end date in the range of interval
 * days before and after the specified date.
 * @Args: integer property_id, string date, integer interval
 * @Returns: string Calendar
 */
function buildCalendarByProperty($property_id, $property_name, $date, $interval=7){
    include('./config.php');
    /* Ensure the date is formatted as needed */
    if($date==""){$date=time();}

    //if(isset($_SESSION['aligndate']) && $_SESSION['aligndate']=='left'){
    //    $date=mktime(date('H', $date), date('i', $date), date('s', $date), date('n', $date), (date('j', $date)+floor($interval/2)), date('Y', $date));
    //}
    //$centerdate = explode('-', date('Y-m-d', strtotime($date)));

    if(isset($_SESSION['aligndate']) && $_SESSION['aligndate']=='left'){
        //$date = mktime(date('H', $date), date('i', $date), date('s', $date), date('n', $date), (date('j', $date)+floor($interval/2)), date('Y', $date));
        $dateStamp = strtotime($date);
        $dateStamp = mktime(date('H', $dateStamp), date('i', $dateStamp), date('s', $dateStamp), date('n', $dateStamp), (date('j', $dateStamp)+$interval), date('Y', $dateStamp));
        $centerdate = explode('-', date('Y-m-d', $dateStamp));
    } else {
        $centerdate = explode('-', date('Y-m-d', strtotime($date)));
    }

    $calendarHTML="";
    /* Make a date for the start and end of our interval. */
    $startinterval=date('Y-m-d', mktime(0,0,0, $centerdate[1], (intval($centerdate[2]) - intval($interval)), $centerdate[0]));
    $endinterval=date('Y-m-d', mktime(0,0,0, $centerdate[1], (intval($centerdate[2]) + intval($interval)), $centerdate[0]));

    /* Build SQL */
    $sql="SELECT * FROM `rental_calendar` "
        ."WHERE ((`rc_start_date` BETWEEN '".str_replace("-", "", $startinterval)."' AND '".str_replace("-", "", $endinterval)."') OR "
        ."(`rc_end_date` BETWEEN '".str_replace("-", "", $startinterval)."' AND '".str_replace("-", "", $endinterval)."')) AND "
        ."`property_id`=".$property_id." ORDER BY rc_status";


    /* If we get something back from the database... */
    if($this->DB->query($sql)){
        /* Fetch our dates as an array of objects. */
        $dates = $this->DB->getObjectList();
        $sql="SELECT * FROM `rental_calendar` INNER JOIN `waiting_room` on `rental_calendar_id` = `rc_id` WHERE "
        ."((`rc_start_date` BETWEEN '".str_replace("-", "", $startinterval)."' AND '".str_replace("-", "", $endinterval)."') OR "
        ."(`rc_end_date` BETWEEN '".str_replace("-", "", $startinterval)."' AND '".str_replace("-", "", $endinterval)."')) AND "
        ."FIND_IN_SET('".$property_id."', `property_ids`)";
        if($this->DB->query($sql)){
            $variableDates = $this->DB->getObjectList();
            $dates = array_merge($dates, $variableDates);
        }
        /* Make an array out of the bits for our start interval (We'll use this
          for comparison with the dates in the rental_calendar entries as well
          as for a key for our 'calendar') */
        $datemarker = explode('-', $startinterval);
        $dateender = explode('-', $endinterval);
        $holidays = array();
        if($datemarker[0]!=$dateender[0]){
            $holidays = array_merge($this->defineHolidays($datemarker[0]), $this->defineHolidays($dateender[0]));
        }else{
            $holidays = $this->defineHolidays($datemarker[0]);
        }
        $events = array();
        if($datemarker[0]!=$dateender[0]){
            $events = array_merge($this->defineEvents($datemarker[0]), $this->defineEvents($dateender[0]));
        }else{
            $events = $this->defineEvents($datemarker[0]);
        }
        /* Make the calendar */
        $calendar = array();
        $colorarray=array();
        $currentdate='';
        /* Set up table for rentals */
        $this->rentals = $this->structureCalendar($dates, $startinterval, $interval);
        /* Open table */
        //$html='<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0px; padding:0px;">'."\n";
        $isSpan = false;
        $colspan=1;
        $currID=array();
        $daysInUse=array();

        foreach($this->rentals as $r){
         $html.='<tr>';
          for($i=0; $i<(($interval*2)+1); $i++){
              /* Grab the current date for comparison */
              $currentdate=date('Y-m-d', mktime(0, 0, 0, $datemarker[1], ($datemarker[2]+$i), $datemarker[0]));
              if(in_array($currentdate, array_keys($r))){
                if($daysInUse[$i]!=1){$daysInUse[$i]=1;}
                if(!$isSpan){
                    $isSpan=true;
                    $currID=$r[$currentdate];
                }else{
                   if($r[$currentdate]->rc_id!=$currID->rc_id){
                      /* Pick a color */
                      $testCell = $currID;
                      switch(strtoupper($testCell->rc_status)){
                          case 'CONFIRMED':
                              $color=$CONFIRMED_COLOR;
                          break;
                          case 'RESERVED':
                              $color=$RESERVED_COLOR;
                          break;
                          case 'TENTATIVE':
                              $color=$TENTATIVE_COLOR;
                          break;
                          case 'OVERSTAY':
                              $color=$OVERSTAY_COLOR;
                          break;
                          case 'CHECKED IN':
                              $color=$CHECKED_IN_COLOR;
                          break;
                          case 'CHECKED OUT':
                              $color=$CHECKED_OUT_COLOR;
                          break;
                          case 'CANCELLED':
                              $color=$CANCEL_COLOR;
                          break;
                          default:
                              $color=$DEFAULT_RC_COLOR;
                          break;
                      }
                      /* Find out if this is a renter or group and get the name and
                         set up the functions */
                      if($testCell->renter_id!=''){
                       $infotype="rc";
                       $sql="SELECT * FROM client WHERE client_id = ".$testCell->renter_id;
                       $this->DB->query($sql);
                       $rt=$this->DB->getObjectList();
                       $thisName=$rt[0]->client_first.' '.$rt[0]->client_last;
                      }else{
                       $infotype="gc";
                       $sql="SELECT * FROM rental_group, client WHERE group_id = ".$testCell->group_id." AND client_id=primary_renter";
                       $this->DB->query($sql);
                       $rt=$this->DB->getObjectList();
                       $thisName=$rt[0]->client_first.' '.$rt[0]->client_last;
                      }
                      /* Do some styling */
                      $style='cursor: pointer; font-size: 9px; overflow: hidden; text-align: center; border: 1px solid #000000; overflow: hidden';
                      /* Do some functions */
                      $functions = 'onmousedown="showRenterInfoDiv(\''.$testCell->rc_id.'\', \''.$infotype.'\');" ';
                                   //.'onmouseout="cancelRenterInfoDiv();" ';
                      if($thisName == ' ') {
                          $thisName = '+++';
                      }
                      /* Output table cell */
                      $html.='<td '.$functions.' bgcolor="'.$color.'" colspan="'.$colspan.'" style="'.$style.'"><div style="overflow: hidden;"><a href="index.php?task=editReservation&rc_id='.$testCell->rc_id.'&interval='.$interval.'&date='.$date.'">'.$thisName.'</a></div></td>'."\n";
                      /* Reset colspan */
                      $colspan=1;
                      $currID=$r[$currentdate];
                   }else{
                        $colspan++;
                   }
                }
              }else{
                if($daysInUse[$i]!=1){$daysInUse[$i]=0;}
                if($isSpan){
                    $isSpan=false; //Stop spanning
                    /* Pick a color */
                    $testCell=$currID;
                    switch(strtoupper($testCell->rc_status)){
                        case 'CONFIRMED':
                            $color=$CONFIRMED_COLOR;
                        break;
                        case 'RESERVED':
                            $color=$RESERVED_COLOR;
                        break;
                        case 'TENTATIVE':
                            $color=$TENTATIVE_COLOR;
                        break;
                        case 'OVERSTAY':
                            $color=$OVERSTAY_COLOR;
                        break;
                        case 'CHECKED IN':
                            $color=$CHECKED_IN_COLOR;
                        break;
                        case 'CHECKED OUT':
                            $color=$CHECKED_OUT_COLOR;
                        break;
                        case 'CANCELLED':
                            $color=$CANCEL_COLOR;
                        break;
                        default:
                            $color=$DEFAULT_RC_COLOR;
                        break;
                    }
                    /* Find out if this is a renter or group and get the name and
                       set up the functions */
                    if($testCell->renter_id!=''){
                     $infotype="rc";
                     $sql="SELECT * FROM client WHERE client_id = ".$testCell->renter_id;
                     $this->DB->query($sql);
                     $rt=$this->DB->getObjectList();
                     $thisName=$rt[0]->client_first.' '.$rt[0]->client_last;
                    }else{
                     $infotype="gc";
                     $sql="SELECT * FROM rental_group, client WHERE group_id = ".$testCell->group_id." AND client_id=primary_renter";
                     $this->DB->query($sql);
                     $rt=$this->DB->getObjectList();
                     $thisName=$rt[0]->client_first.' '.$rt[0]->client_last;
                    }
                    /* Do some styling */
                    $style='cursor: pointer; font-size: 9px; overflow: hidden; text-align: center; border: 1px solid #000000; overflow: hidden';
                    /* Do some functions */
                    $functions = 'onmousedown="showRenterInfoDiv(\''.$testCell->rc_id.'\', \''.$infotype.'\');" ';
                                 //.'onmouseout="cancelRenterInfoDiv();" ';
                    if($thisName == ' ') {
                        $thisName = '+++';
                    }
                    /* Output table cell */
                    $html.='<td '.$functions.' bgcolor="'.$color.'" colspan="'.$colspan.'" style="'.$style.'"><div style="overflow: hidden;"><a href="index.php?task=editReservation&rc_id='.$testCell->rc_id.'&interval='.$interval.'&date='.$date.'">'.$thisName.'</a></div></td>'."\n";
                    /* Reset colspan */
                    $colspan=1;
                }
                $weekendCheck=getdate(strtotime($currentdate));
                // If this day is not either Sunday or Saturday
                if($weekendCheck['wday']!=0 && $weekendCheck['wday']!=6){
                    $thisHighlight = '#FFFFFF'; //Apply a white background
                }else{
                    $thisHighlight = $WEEKEND_HIGHLIGHT; //Apply the weekend highlight
                }
                // If this is the 'center date'
                if($i==($interval)){
                    $thisHighlight = $CENTERDATE_HIGHLIGHT; //Apply the 'center date' highlight
                }
                if($v=$this->search_holidays(strtotime($currentdate), $holidays)){
                    $thisHighlight = $HOLIDAY_HIGHLIGHT;
                }
                if($v=$this->search_events($currentdate, $events, $property_id, false)){
                    $thisHighlight = $EVENT_HIGHLIGHT;
                }
                /* Add a blank cell */
                $html.='<td bgcolor="'.$thisHighlight.'" style="border: 1px solid #000000; overflow: hidden;"><div style="overflow: hidden;">&nbsp;</div></td>'."\n";
              }
          }
            if($isSpan){
                  if($daysInUse[$i-1]!=1){$daysInUse[$i-1]=0;}
                    $isSpan=false; //Stop spanning
                    // Pick a color
                    $testCell=$currID;
                    switch(strtoupper($testCell->rc_status)){
                        case 'CONFIRMED':
                            $color=$CONFIRMED_COLOR;
                        break;
                        case 'RESERVED':
                            $color=$RESERVED_COLOR;
                        break;
                        case 'TENTATIVE':
                            $color=$TENTATIVE_COLOR;
                        break;
                        case 'OVERSTAY':
                            $color=$OVERSTAY_COLOR;
                        break;
                        case 'CHECKED IN':
                            $color=$CHECKED_IN_COLOR;
                        break;
                        case 'CHECKED OUT':
                            $color=$CHECKED_OUT_COLOR;
                        break;
                        case 'CANCELLED':
                            $color=$CANCEL_COLOR;
                        break;
                        default:
                            $color=$DEFAULT_RC_COLOR;
                        break;
                    }
                    // Find out if this is a renter or group and get the name and set up the functions
                    if($testCell->renter_id!=''){
                     $infotype="rc";
                     $sql="SELECT * FROM client WHERE client_id = ".$testCell->renter_id;
                     $this->DB->query($sql);
                     $rt=$this->DB->getObjectList();
                     $thisName=$rt[0]->client_first.' '.$rt[0]->client_last;
                    }else{
                     $infotype="gc";
                     $sql="SELECT * FROM rental_group, client WHERE group_id = ".$testCell->group_id." AND client_id=primary_renter";
                     $this->DB->query($sql);
                     $rt=$this->DB->getObjectList();
                     $thisName=$rt[0]->client_first.' '.$rt[0]->client_last;
                    }
                    // Do some styling
                    $style='cursor: pointer; font-size: 9px; overflow: hidden; text-align: center; border: 1px solid #000000; overflow: hidden';
                    // Do some functions
                    $functions = 'onmousedown="showRenterInfoDiv(\''.$testCell->rc_id.'\', \''.$infotype.'\');" ';
                                 //.'onmouseout="cancelRenterInfoDiv();" ';
                    if($thisName == ' ') {
                        $thisName = '+++';
                    }
                    // Output table cell
                    $html.='<td '.$functions.' bgcolor="'.$color.'" colspan="'.$colspan.'" style="'.$style.'"><div style="overflow: hidden;"><a href="index.php?task=editReservation&rc_id='.$testCell->rc_id.'&interval='.$interval.'&date='.$date.'">'.$thisName.'</a></div></td>'."\n";
                    // Reset colspan
                    $colspan=1;
                }
          $html.='</tr>';
        }
        $html.='<tr>'."\n";
        /* Iterate through the days, adding cells */
        for($i=0; $i<(($interval*2)+1); $i++){
            $currentdate=date('Y-m-d', mktime(0, 0, 0, $datemarker[1], ($datemarker[2]+$i), $datemarker[0]));
            if($daysInUse[$i]==0){
                $n='name="unused" ';
                //flag that the property is available at least one day in the specified interval
                $this->availableInInterval = true;
            }else{
                $n='name="used" ';
                //the property may still be "available" on this date even tho it is already rented if it is a multi-unit property
                //check unit availability only if the property has not been confirmed available in the calendar period
                if($this->availableInInterval != true) {
                    $this->isUnitAvailable($property_id, $currentdate);
                }
            }
            if($v=$this->search_events($currentdate, $events, $property_id, false)){
                $n.='blockout="yes" ';
            }else{
                $n.='blockout="no" ';
            }
            $currentdate=date('Y-m-d', mktime(0, 0, 0, $datemarker[1], ($datemarker[2]+$i), $datemarker[0]));
            
            $html.='<td class="notselected" id="'.$property_id.'-'.$currentdate.'" '.$n
                      .'onmousedown="javascript:selectDate(\''.$property_id.'\', \''.$property_name.'\', '
                      .'\''.date('m/d/Y', strtotime($currentdate)).'\', \''.$currentdate.'\');" width="'.floor((75/(($interval*2)+1))).'%" '
                      .'style="cursor: pointer; text-align: center; border-bottom: 2px solid #000000;"><div style="min-width: 15px;">&nbsp;+&nbsp;</div></td>'."\n";
             /*
            $html.='<td class="notselected" id="'.$property_id.'-'.$currentdate.'" '.$n
                      .'onmousedown="javascript:selectDate(\''.$property_id.'\', \''.$property_name.'\', '
                      .'\''.date('m/d/Y', strtotime($currentdate)).'\', \''.$currentdate.'\');" width="'.floor((75/(($interval*2)+1))).'%" '
                      .'style=""><div class="plus"> + </div></td>'."\n";
            */
        }
        /* Close seelctor row */
        $html.='</tr>'."\n";
        //$html.='</table>';
        //$html.= '<!-- '."\n".print_r($events, true)."\n".' -->';
        /* Complete HTML */
        $calendarHTML .= $html ."\n";
    }else{
        $calendarHTML= '<div>Error Fetching Calendar for Property ID: '.$property_id.'</div>'."\n";
    }
    /* Debugging */
    //var_dump($dates);
    //$calendarHTML .= '<!-- '.print_r($this->rentals, true)."\n".print_r($theseRows, true).' -->';
    /*
    echo 'Centerdate: ';
    var_dump($centerdate);
    echo "<br>";
    echo 'Startinterval: ';
    var_dump($startinterval);
    echo "<br>";
    echo 'Endinterval: ';
    var_dump($endinterval);
    echo "<br>";
    echo 'SQL: ';
    var_dump($sql);
    echo "<br>";
    echo 'Calendar: ';
    var_dump($calendar);
    echo "<br>";
    var_dump($colorarray);
    echo "<br>";
     */
    return $calendarHTML;
}

/* Function: buildDisplayCalendar()
 * This function builds the HTML for displaying the properties and their
 * rental schedules.
 * @Args: array Properties, string date, int range
 * @Returns: string HTML
 */
function buildDisplayCalendar(&$properties, $date, $range, $showUnavailable=0){
include('config.php');

   $c.='<table width="100%" cellspacing="0" cellpadding="0" id="calendarTable">'
       .'<tr>'
       //.'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=property_id&date='.$date.'&interval='.$range.'">ID</a></td>'
       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=r_number&date='.$date.'&interval='.$range.'">R#</a></td>'
       .'<td width="7%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=property_name&date='.$date.'&interval='.$range.'">Facility</a></td>'
       .'<td width="7%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=property_type&date='.$date.'&interval='.$range.'">Type</a></td>'
       .'<td width="3%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=nightly_rate&date='.$date.'&interval='.$range.'">Rate</a></td>'
       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=bath_type&date='.$date.'&interval='.$range.'">#Bath</a></td>'
       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=num_bed&date='.$date.'&interval='.$range.'">#Bed</a></td>'
       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5">Bed Types</td>'
       //.'<td style="border-top: 2px solid #000000; border-bottom: 2px solid #000000;">'.$this->buildCalendar($date, $range).'</td>'   //calendar days will be here
       .$this->buildCalendar($date, $range)
       .'</tr>';
     $counter=1;
    //build row for each property
    $oddeven='';
    if(is_array($properties)){
        foreach($properties AS $r){
            switch($r->property_sched_type){
                case 0:
                    $propHighlight='bgcolor="'.$NORMAL_HIGHLIGHT.'"';
                break;
                case 1:
                    $propHighlight='bgcolor="'.$AGRESSIVE_HIGHLIGHT.'"';
                break;
                case 2:
                    $propHighlight='bgcolor="'.$STRICT_HIGHLIGHT.'"';
                break;
                default:
                    $propHighlight='bgcolor="'.$NORMAL_HIGHLIGHT.'"';
                break;
            }

            $this->availableInInterval = false;
            $rentalEntries=$this->buildCalendarByProperty($r->property_id, addslashes($r->property_name), $date, $range);

            if( $this->availableInInterval == true || $showUnavailable==1 ) {
                if($oddeven=='even')
                {$rowcolor=$EVEN_ROW; $oddeven='odd';}
                else
                {$rowcolor=$ODD_ROW; $oddeven='even';}
                //$rentalEntries=$this->buildCalendarByProperty($r->property_id, $r->property_name, $date, $range);
                $rentalRowCount=count($this->rentals);
                if($rentalRowCount<1)
                    {$rentalRowCount=3;}
                else
                    {$rentalRowCount=$rentalRowCount+2;}
                unset($this->rentals);

                $functions = 'onmousedown="showPropertyInfoDiv(\''.$r->property_id.'\', \'p\');" ';
                    //.'onmouseout="cancelPropertyInfoDiv();" ';

                //$c.='<!-- '.$rentalRowCount.' -->'."\n";
                $c.='<tr bgcolor="'.$rowcolor.'">'
                //.'<td '.$propHighlight.' align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->property_id.'</td>'
                .'<td '.$propHighlight.' align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->r_number.'</td>'
                .'<td align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->property_name.'</td>'
                .'<td align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->property_type.'</td>'
                .'<td align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->nightly_rate.'</td>'
                .'<td align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->bath_type.'</td>'
                .'<td align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->num_bed.'</td>'
                .'<td align="center" style="border: 2px solid #000000; cursor: pointer;" rowspan="'.$rentalRowCount.'" '.$functions.'>'.$r->bed_type.'</td>'
                //.'<td style="border-top: 2px solid #000000; border-bottom: 2px solid #000000;">'. $this->buildCalendarByProperty($r->property_id, $r->property_name, $date, $range). '</td>'
                .$rentalEntries
                .'</tr>';
                if($counter==$NUM_CAL_ROWS){
                    $c.='<tr>'
                       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=property_id&date='.$date.'&interval='.$range.'">ID</a></td>'
                       .'<td width="7%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=property_name&date='.$date.'&interval='.$range.'">Facility</a></td>'
                       .'<td width="7%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=property_type&date='.$date.'&interval='.$range.'">Type</a></td>'
                       .'<td width="3%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=nightly_rate&date='.$date.'&interval='.$range.'">Rate</a></td>'
                       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=bath_type&date='.$date.'&interval='.$range.'">#Bath</a></td>'
                       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5"><a href="index.php?task=calendarView&sort=num_bed&date='.$date.'&interval='.$range.'">#Bed</a></td>'
                       .'<td width="2%" align="center" style="border: 2px solid #000000;" rowspan="5">Bed Types</td>'
                       .$this->buildCalendar($date, $range).'</tr>';
                }
                $counter++;
                $this->availableInInterval = false; //reset flag for next property
            }
        }
    }

    $c.='</table></div>';
    return $c;
}


/* Function: structureCalendar()
 * This function parses the rental calendar items returned from the database
 * into an array that we can use for building a table.
 * @Args: array Date Objects, string start, int interval
 * @Returns: array rentals
 */
function structureCalendar(&$dates, $start, $interval){
  $datemarker=explode('-', $start);
  $rentals = array();
  $currRow = 0;
  $rentals[$currRow]=array();
  $currId = -1;
  foreach($dates as $d){
    for($i=0; $i<(($interval*2)+1); $i++){
        /* Grab the current date for comparison */
        $currentDate=date('Y-m-d', mktime(0, 0, 0, $datemarker[1], ($datemarker[2]+$i), $datemarker[0]));
        if(strtotime($currentDate)>=strtotime($d->rc_start_date) && strtotime($currentDate)<=strtotime($d->rc_end_date)){
           $stopgap=false;
           while(!$stopgap){
              if(in_array($currentDate, array_keys($rentals[$currRow]))){
                  $currRow++;
                  if(!isset($rentals[$currRow])){$rentals[$currRow]=array();}
              }else{
                    $skip=false;
                    $rowcheck=$this->getStarts($rentals[$currRow]);
                    $rowend = $this->getEnds($rentals[$currRow]);
                    for($t=0; $t<count($rowcheck); $t++){
                        if((strtotime($d->rc_start_date) <= strtotime($rowcheck[$t]) || $d->rc_end_date >= strtotime($rowend[$t]))
                            && !in_array($d->rc_id, $this->getIds($rentals[$currRow]))){
                            $skip=true;
                        }
                    }
                    if($skip){
                        $currRow++;
                        if(!isset($rentals[$currRow])){$rentals[$currRow]=array();}
                    }else{
                      $rentals[$currRow][$currentDate]=$d;
                      $currRow=0;
                      $currId=$d->rc_id;
                      $stopgap=true;
                    }
              }
           } // End While
        } //End If
    } //End For
  } //End ForEach
  return $rentals;
}

function getStarts(&$dates){
    $starter=array();
    foreach($dates as $d){
        array_push($starter, $d->rc_start_date);
    }
    return $starter;
}

function getEnds(&$dates){
    $ender=array();
    foreach($dates as $d){
        array_push($ender, $d->rc_start_date);
    }
    return $ender;
}

function getIds(&$dates){
    $ids=array();
    foreach($dates as $d){
        array_push($ids, $d->rc_id);
    }
    return $ids;
}

/* Function: getNow()
 * All this function does is return the current timestamp formatted as a
 * MySQL datetime field
 * @Args: None
 * @Returns: string Now
 */
function getNow(){
    return date('Y-m-d h:i:s', time());
}

/* Function: showLegend()
 * This function returns an HTML representation of the calendar legend, showing
 * what colors on the calendar represent.
 * @Args: None
 * @Returns: string HTML Legend
 */
function showLegend(){
    include('./config.php');
    $legend='<div id="legend" style="border: 1px solid #000000; width: 400px; height: 215px; float: left; background-color: #FFFFFF; margin: 5px; position: absolute; right: 25px;">'."\n"
           .'<div style="margin: 5px; float: left; clear: left; font-weight: bold;">Legend:</div>'
           .'<div style="margin: 5px; float: right; clear: right; font-weight: bold; cursor: pointer;" '
           .'onclick="if(document.getElementById(\'legendarydiv\').style.display==\'none\'){this.innerHTML=\'[X]\'; document.getElementById(\'legend\').style.height=\'215px\';}else{this.innerHTML=\'[?]\'; document.getElementById(\'legend\').style.height=\'30px\';} '
           .'toggleElement(\'legendarydiv\');">[X]</div>'
           .'<div id="legendarydiv" style="display: block;">'."\n"
           .'<div style="margin: 5px; float: left; clear: left; font-weight: bold;">Calendar Colors: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>'
           .'<div style="margin: 5px; float: left; font-weight: bold;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Reservation Colors:</div>'
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$WEEKEND_HIGHLIGHT.'; border: 1px solid #000000; float: left; clear: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Weekend</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$HOLIDAY_HIGHLIGHT.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Holiday&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$CONFIRMED_COLOR.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Confirmed</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$RESERVED_COLOR.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Reserved</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$EVENT_HIGHLIGHT.'; border: 1px solid #000000; float: left; clear: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Event &nbsp;&nbsp;&nbsp;&nbsp;</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$CENTERDATE_HIGHLIGHT.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Center Date</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$TENTATIVE_COLOR.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left; width: 60px;">Tentative</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$OVERSTAY_COLOR.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Overstay</div>'."\n"
           .'<div style="margin: 5px; width: 178px; float: left; clear: left;">&nbsp;</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$CHECKED_IN_COLOR.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Checked In</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$CHECKED_OUT_COLOR.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Checked Out</div>'."\n"
           .'<div style="margin: 5px; float: left; clear: both; font-weight: bold; width: 178px;">Scheduling Colors:</div>'
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$CANCEL_COLOR.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Cancelled</div>'."\n"

           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$NORMAL_HIGHLIGHT.'; border: 1px solid #000000; float: left; clear: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Normal</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$STRICT_HIGHLIGHT.'; border: 1px solid #000000; float: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Strict</div>'."\n"
           .'<div style="margin: 5px; width: 12px; height: 12px; min-height: 12px; background-color: '.$AGRESSIVE_HIGHLIGHT.'; border: 1px solid #000000; float: left; clear: left;">&nbsp;</div>'
           .'<div style="margin: 5px; float: left;">Agressive</div>'."\n"
           .'</div>'."\n"
           .'</div>'."\n";
    return $legend;
}

/* Function: defineHolidays()
 * This function builds an associative array of date timestamps for a number of
 * commonly observed holidays for a given year.
 * @Args: int year (4-digit)
 * @Returns: array Holiday Calendar
 */
function defineHolidays($year){
    /* Start our calendar */
    $HOLIDAYS = array();
    /* New Years Day and Valentines Day are statically set */
    $HOLIDAYS[0] = array('name'=>'New Years Day', 'date'=>mktime(0,0,0,1,1,$year));
    $HOLIDAYS[1] = array('name'=>'Valentines Day', 'date'=>mktime(0,0,0,2,14,$year));
    /* Presidents Day is a floating holiday */
    $HOLIDAYS[2] = array('name'=>'Presidents Day', 'date'=>$this->calculateHolidayDate(3, 1, 2, $year));
    /* St. Patricks Day is static */
    $HOLIDAYS[3] = array('name'=>'St. Patricks Day', 'date'=>mktime(0,0,0,3,17,$year));
    /* Easter requires a special function to find. o.O */
    $HOLIDAYS[4] = array('name'=>'Easter', 'date'=>easter_date($year));
    /* Cinco De Mayo is static */
    $HOLIDAYS[5] = array('name'=>'Cinco De Mayo', 'date'=>mktime(0,0,0,5,5,$year));
    /* Mothers Day is a floating holiday */
    $HOLIDAYS[6] = array('name'=>'Mothers Day', 'date'=>$this->calculateHolidayDate(2, 0, 5, $year));
    /* Memorial day takes a little extra calculation. It's usually the 4th
       Monday of May...unless there are 5 Mondays in May... */
    $memorialDay = $this->calculateHolidayDate(4, 1, 5, $year);
    $mdAsDay=date('j', $memorialDay);
    /* So, if the 4th Monday falls on a date less than 25, there is a fifth
       Monday, so we add a week. */
    if(intval($mdAsDay)<25){
        $HOLIDAYS[7] = array('name'=>'Memorial Day', 'date'=>strtotime('05/'.($mdAsDay+7).'/'.$year.' 00:00:00'));
    }else{
        $HOLIDAYS[7] = array('name'=>'Memorial Day', 'date'=>$memorialDay);
    }
    /* Father's Day is a floating holiday */
    $HOLIDAYS[8] = array('name'=>'Fathers Day', 'date'=>$this->calculateHolidayDate(3, 0, 6, $year));
    /* Independence Day is static */
    $HOLIDAYS[9] = array('name'=>'Independence Day', 'date'=>mktime(0,0,0,7,4,$year));
    /* Labor Day is a floating holiday */
    $HOLIDAYS[10] = array('name'=>'Labor Day', 'date'=>$this->calculateHolidayDate(1, 1, 9, $year));
    /* Halloween, Veterans Day, Chirstmas Eve, Christmas Day, and New Years Eve
       are all static. */
    $HOLIDAYS[11] = array('name'=>'Halloween', 'date'=>mktime(0,0,0,10,31,$year));
    $HOLIDAYS[12] = array('name'=>'Veterans Day', 'date'=>mktime(0,0,0,11,11,$year));
    $HOLIDAYS[13] = array('name'=>'Christmas Eve', 'date'=>mktime(0,0,0,12,24,$year));
    $HOLIDAYS[14] = array('name'=>'Christmas Day', 'date'=>mktime(0,0,0,12,25,$year));
    $HOLIDAYS[15] = array('name'=>'New Years Eve', 'date'=>mktime(0,0,0,12,31,$year));
    /* Return Holidays */
    return $HOLIDAYS;
}

/* Function: calculateHolidayDate()
 * This function takes the parameters for certain holidays and returns the date
 * that holiday occurrs on. This is useful for finding holidays that do not have
 * a specific date assigned to them (like Labor Day, Thanksgiving, etc). Certain
 * other holidays will require a little extra processing of the results (like
 * Memorial Day or Election Day).
 * @Args: int $occurrences, int dayOfWeek (0-6), int month (1-12), int year (4-digit)
 * @Returns: int Holiday Date Timestamp
 */
function calculateHolidayDate($occurrence, $dayOfWeek, $month, $year){
    /* Find the earliest occurrence of the given day */
    $nEarliestDate = 1 + 7 * ($occurrence - 1);
    /* Get the day of the week for this */
    $nWeekday = date("w",mktime(0,0,0,$month,$nEarliestDate,$year));
    /* If it matches our given day, no offset */
    if( $dayOfWeek==$nWeekday ) $nOffset = 0;
    else
    { /* If it is greater than the given day, move forward a week. Else, move
         back a week...*/
      if( $dayOfWeek<$nWeekday ) $nOffset = $dayOfWeek + (7 - $nWeekday);
      else $nOffset = ($dayOfWeek + (7 - $nWeekday)) - 7;
    }
   /* Return the resulting timestamp */
   return mktime(0,0,0,$month,$nEarliestDate + $nOffset,$year);

}

/* Function: search_holidays
 * This function searches the object array returned by the defineHolidays function
 * for a specific holiday either by name of the holiday or a date that fall on an
 * holiday.
 * @Args: mixed needle, mixed haystack, boolean isName
 * @Args: integer found or false if not found
 */
function search_holidays($needle, &$haystack, $isName=false){
    $found=false;
    $counter=0;
    foreach($haystack as $h){
       if($isName){
         if($h['name']==$needle){
             $found=$counter;
             break;
         }
       }else{
         if($h['date']==$needle){
             $found=$counter;
             break;
         }
       }
        $counter++;
    }
    return $found;
}

/* Function: defineEvents
 * This function searches the database for all events that fall upon a given year
 * and returns an array of event objects.
 * @Args: integer year
 * @Returns: array Objects
 */
function defineEvents($year){
    $sql="SELECT * FROM event WHERE (event_start BETWEEN '".date('Ymd', mktime(0,0,0,1,1,$year))."' AND "
        ."'".date('Ymd', mktime(0,0,0,12,31,$year))."') OR (event_end BETWEEN '".date('Ymd', mktime(0,0,0,1,1,$year))."' "
        ."AND '".date('Ymd', mktime(0,0,0,12,31,$year))."')";
    if($this->DB->query($sql)){
        return $this->DB->getObjectList();
    }else{
        return false;
    }
}

/* Function: search_events
 * This function searches the object array returned by the defineEvents function
 * for a specific event either by name of the event or a date that fall on an
 * event.
 * @Args: mixed needle, mixed haystack, boolean isName
 * @Args: boolean found
 */
function search_events($needle, &$haystack, $pid='-1', $isName=false){
    $found=false;
    $counter=0;
    if($isName){
        foreach($haystack as $h){
            if($h->event_name==$needle){
                $found=$counter;
                break;
            }
            $counter++;
        }
    }else{
       if($pid!='-1'){
          foreach($haystack as $h){
              $pids = explode(',', str_replace(' ', '', $h->event_properties));
              if((strtotime($h->event_start)<=strtotime($needle) &&
                   strtotime($h->event_end)>=strtotime($needle)) &&
                    (in_array($pid, $pids) || in_array('-1', $pids))){
                  $found=true;
                  break;
              }
              $counter++;
          }
       }else{
          foreach($haystack as $h){
              $pids = explode(',', str_replace(' ', '', $h->event_properties));
              if((strtotime($h->event_start)<=strtotime($needle) &&
                   strtotime($h->event_end)>=strtotime($needle))){
                  $found=true;
                  break;
              }
              $counter++;
          }
       }
    }
    reset($haystack);
    return $found;
}

/* Function: select_events
 * This function searches the object array returned by the defineEvents function
 * for a specific event either by name of the event or a date that fall on an
 * event.
 * @Args: mixed needle, mixed haystack, boolean isName
 * @Args: object Event
 */
function select_events($needle, &$haystack, $pid='-1', $isName=false){
    $found=false;
    $counter=0;
    if($isName){
        foreach($haystack as $h){
            if($h->event_name==$needle){
                $found=$h;
                break;
            }
            $counter++;
        }
    }else{
       if($pid!='-1'){
          foreach($haystack as $h){
              $pids = explode(',', str_replace(' ', '', $h->event_properties));
              if((strtotime($h->event_start)<=strtotime($needle) &&
                   strtotime($h->event_end)>=strtotime($needle)) &&
                    (in_array($pid, $pids) || in_array('-1', $pids))){
                  $found=$h;
                  break;
              }
              $counter++;
          }
       }else{
          foreach($haystack as $h){
              $pids = explode(',', str_replace(' ', '', $h->event_properties));
              if((strtotime($h->event_start)<=strtotime($needle) &&
                   strtotime($h->event_end)>=strtotime($needle))){
                  $found=$h;
                  break;
              }
              $counter++;
          }
       }
    }
    reset($haystack);
    return $found;
}

/* Function: showHolidays()
 * This function simply calculates the holidays for a given year and returns a
 * legend, listing the holidays and their dates.
 * @Args: int year (4-digit)
 * @Returns: string Holidays
 */
function showHolidays($year){
    $holidays = $this->defineHolidays($year);
    $legend='<div style="border: 1px solid #000000; width: 200px; height: 300px; float: left; margin: 5px;">'."\n";
    $legend.='Holidays for '.$year.'<br><br>'."\n";
    foreach($holidays as $h){
        $legend .= $h['name'].'  -  '.date('M d, Y', $h['date']).'<br>'."\n";
    }
    $legend.='</div>';
    return $legend;
}

function isUnitAvailable($propertyId, $day) {
    //check if there are multiple rental units for this property
    $checkUnits = '';
    $unitSql = 'SELECT * FROM property_unit WHERE'
            . ' property_id = ' . $propertyId;
    if($this->DB->query($unitSql)) {
        $units=$this->DB->getObjectList();
        if($units){
            //array to store units rented for this day
            $rentedUnits = array();
            //query for all rentals for the specified property and day
            //along with the units selected for each rental
            $uSql = 'SELECT R.*, J.* FROM rental_calendar AS R '
                . ' LEFT JOIN rental_to_unit AS J ON R.rc_id = J.rc_id'
                . ' WHERE R.property_id = ' . $propertyId
                . ' AND '
                . '( rc_start_date <= "'.$day.'" AND rc_end_date >= "'.$day.'")';
            if($this->DB->query($uSql)) {
                $rentals=$this->DB->getObjectList();
                if($rentals){
                    foreach($rentals AS $r) {
                        //put the ids of units taken already selected for this rental into an array
                        if($r->unit_id != 0 && $r->unit_id != '') {
                            $rentedUnits[] = $r->unit_id;
                        }
                    }
                    //remove any duplicate entries from the array
                    $rentedUnits = array_unique($rentedUnits);
                }
            }
            //loop through the units for the given property
            foreach($units AS $u) {
                //check if the current unit is rented out on this day
                if(in_array($u->unit_id, $rentedUnits)) {
                    //this unit is not available
                } else {
                    //this unit is available for the specified property and day
                    $this->availableInInterval = true;
                    //we only need to find one so return true to exit function
                    return true;
                }
            }
        }
    }
}

/* Function: closeCal()
 * This function is the call back used by this class to do cleanup before the
 * class is disposed of.
 * @Args: None
 * @Returns: None
 */
function closeCal(){
    unset($this->DB);
}
}
?>