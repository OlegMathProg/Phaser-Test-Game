/* global start_game_text, Phaser */

(function GameStart() {
//"use strict";
var config={
   type    : Phaser.AUTO,
   width   : 1024,
   height  : 700,
   pixelArt: true, 
   scene   : 
   {
     preload: preload,
     create : create,
     update : update,
     render : render
   }
};

var game=new Phaser.Game(config);

// Global variables
var background;
var play_btn;
var donuts_label;
var volume_enable_btn;
var hand;
var move_direction='down';
var skip_frame=0;
var graphics;
var line_arr=new Array(8); // var line_arr=[];
var draw_grid=false;
var fade_power_0=1;
var game_timer_0=false;
var game_timer_0_start=0;
var game_timer_1_start=0;
var bg_score;
var score_text;
var score_text_string='0';
var start_game_text;
var game_timer_text;
var time_up;

// Array of gems(donuts)
var gem_arr    =new Array(7);
var gem_pts_arr=new Array(7);
var gem_refresh=false;
var gem_count  =7;

function preload() 
{
  // this.scale.fullScreenScaleMode  = Phaser.ScaleManager.SHOW_ALL;
  // this.scale.pageAlignHorizontally=true;
  // this.scale.pageAlignVertically  =true;
  // this.stage.backgroundColor      ='#eee';
  with (this.load)
  {
    // Starting screen loading
    image('background','images/backgrounds/background.jpg');
    image('play','images/menu/btn-play.png');
    image('donuts','images/menu/donuts_logo.png');
    image('volume','images/menu/btn-sfx.png');
    image('hand','images/game/hand.png');
    audio('menu_music',['audio/background.mp3'/*,'audio/background.ogg'*/]);
    audio('btn_music',['audio/select-9.mp3'/*,'audio/select-9.ogg'*/]);    
    // Game screen loading
    image('score','images/game/bg-score.png');
    image('time_up','images/game/text-timeup.png');
    // Gems loading
    for(let i=0;i<gem_arr.length;i++)
      this.load.image('gem_'+(i+1),'images/game/gem-0'+(i+1)+'.png');
  }
}

function create() 
{     
  const BG_SCORE_LEFT=880;
  const BG_SCORE_TOP =600;
  const LINE_EXP     =80+92*5; 
  // Background init
  background       =this.add.image(0,0,'background').setOrigin(0,0);
  // Gems init
  const POS_XY_LIMIT=700;
  const PTS_LIMIT   =100;
  for(let i=0;i<gem_arr.length;i++)
  {  
    gem_arr[i]=this.add.sprite(Math.floor(Math.random()*POS_XY_LIMIT)+1,
                               Math.floor(Math.random()*POS_XY_LIMIT)+1,
                               'gem_'+(i+1))
                       .setOrigin(0,0)
                       .setInteractive(new Phaser.Geom.Circle(49,50,49),Phaser.Geom.Circle.Contains);
    gem_pts_arr[i]=Math.floor(Math.random()*PTS_LIMIT)+1;           
  }               
  // Grid init
  graphics         =this.add.graphics({lineStyle:{width:8,color:0xffffff}});
  // Main menu init
  play_btn         =this.add.sprite(350,300,'play').setOrigin(0,0).setInteractive(new Phaser.Geom.Rectangle(0,0,286,180),Phaser.Geom.Rectangle.Contains);
  donuts_label     =this.add.sprite(190,50,'donuts').setOrigin(0,0);  
  volume_enable_btn=this.add.sprite(50,450,'volume').setOrigin(0,0).setInteractive(new Phaser.Geom.Circle(69,70,69),Phaser.Geom.Circle.Contains);
  hand             =this.add.sprite(500,380,'hand').setOrigin(0,0);  
  // Game screen init
  start_game_text        =this.add.text(430,170,'1',{fontFamily:'Times New Roman',fontSize:'250px',fill:'#f5f',fontStyle:'Normal',fontWeight:'bold'});
  start_game_text.visible=false;
  game_timer_text        =this.add.text(420,15,'00:00',{fontFamily:'Times New Roman',fontSize:'60px',fill:'#a5a',fontStyle:'Normal',fontWeight:'bold'});
  game_timer_text.visible=false;
  bg_score               =this.add.sprite(BG_SCORE_LEFT,BG_SCORE_TOP,'score').setScale(0.7);
  bg_score.visible       =false;
  bg_score.x             =BG_SCORE_LEFT;
  bg_score.y             =BG_SCORE_TOP;
  score_text             =this.add.text(BG_SCORE_LEFT-100,BG_SCORE_TOP-36,'0',{fontSize:'60px',fill:'#fff'});
  score_text.visible     =false;
  time_up                =this.add.sprite(260,100,'time_up').setOrigin(0,0);
  time_up.visible        =false;
  // Background music  
  let sound_0=this.sound.add('menu_music');
  sound_0.play();  
  // Buttons music 
  let sound_1=this.sound.add('btn_music');
  // volume_enable event handler 
  volume_enable_btn.on('pointerdown',
                       function() 
                       {
                         if (sound_0.isPlaying) 
                         {
                           volume_enable_btn.setTint(0x711fff);
                           sound_0.pause();
                         }
                         else
                         if (sound_0.isPaused) 
                         {
                           volume_enable_btn.clearTint();
                           sound_0.resume();
                         }
                       });                     
  // General input event handlers
  this.input.on('gameobjectover',
                function(pointer,gameObject) 
                {
                  if (((gameObject===volume_enable_btn)&&((sound_0.isPlaying)))||(gameObject===play_btn)) 
                    gameObject.setTint(0x7fffaa);
                });
  this.input.on('gameobjectout',
                function(pointer,gameObject) 
                {
                  if (((gameObject===volume_enable_btn)&&((sound_0.isPlaying)))||(gameObject===play_btn)) 
                    gameObject.clearTint();   
                });
  this.input.on('gameobjectdown',
                function(pointer,gameObject) 
                {
                  sound_1.play();
                  for(let i=0;i<gem_arr.length;i++)
                    if (gameObject===gem_arr[i])
                    {   
                      gem_arr[i].setAlpha(0);
                      if (game_timer_0)
                      {
                        score_text_string=parseInt(score_text_string)+gem_pts_arr[i];
                        score_text.setText(score_text_string);
                        gem_count--;  
                        if (gem_count===0)  
                          gem_refresh=true;
                        if (gem_count>0)                 
                          gem_refresh=false;
                        if (gem_count<=0)
                          gem_count=7;
                        // score_text.setText(gem_count);
                      }
                    }  
                  if (gameObject===play_btn)
                  {                    
                    bg_score.visible  =true; // bg_score.alpha=255;
                    score_text.visible=true; // ...
                    draw_grid         =true;
                    for(let i=0;i<line_arr.length-2;i++)
                      line_arr[i]=new Phaser.Geom.Line(180,80+92*i,808,80+92*i);
                    line_arr[6]=new Phaser.Geom.Line(180,80,180,LINE_EXP);
                    line_arr[7]=new Phaser.Geom.Line(808,80,808,LINE_EXP);
                    game_timer_0=true;
                  }
                });
}

function update()
{
  // Main menu: hand animation loop
  if (!draw_grid)
    switch(skip_frame)
    {
      case 0:
      {
        skip_frame=1;
        if ((hand.y>=380) && (hand.y<=390))
        {
          if (move_direction==='down')
            hand.y+=1;
          else
            hand.y-=1;
          return;
        }  
        if (hand.y>390)
        {
          move_direction='up';
          hand.y-=1;
          return;
        }
        if (hand.y<380)
        {
          move_direction='down';
          hand.y+=1;
          return;
        }
        break;
      }
      case 1: {skip_frame=2; break;}
      case 2: {skip_frame=3; break;}
      case 3: {skip_frame=0; break;}
    }
  // Start game
  else
    if (fade_power_0!==0)
    {
      if (game_timer_0)
      {
        // 1,2,3,...,Start
        game_timer_0_start+=0.03;
        for(let i=0;i<3;i++)
          if ((game_timer_0_start>i+1)&&(game_timer_0_start<i+2))
            with (start_game_text)
            {
              visible=true;
              setText(i+1);
              setAlpha(i+2-game_timer_0_start);
            }
        // Game timer
        if (game_timer_0_start>4)
        {
          game_timer_1_start++;
          game_timer_text.visible=true;
          let exp_0=Math.floor(game_timer_1_start/20);
          if (exp_0>=60)
          {
            game_timer_0=false;
            game_timer_text.setText('00:00');
            time_up.visible=true;
          }
          else
          {
            if (exp_0>50)
              game_timer_text.setText('00:'+'0'+(60-exp_0));
            else
              game_timer_text.setText('00:'    +(60-exp_0));
          }
          if (gem_refresh)
          {
            // Show donuts in random positions of grid
            for(let i=0;i<gem_arr.length;i++)
            {  
              gem_arr[i].x=180+628*(Math.floor(Math.random()*6))/6;
              gem_arr[i].y=76+460*(Math.floor(Math.random()*5))/5;     
              gem_arr[i].setAlpha(1);    
            }
            gem_refresh=false;
          }
        }
      } 
      graphics.clear(); // Performance decreases, if remove!!! (At least on Microsoft Edge)
      for(let i=0;i<line_arr.length;i++)
      {
        // Phaser.Geom.Line(line_arr[i]);
        graphics.strokeLineShape(line_arr[i]);
      }
      if (fade_power_0>0)
      {
        fade_power_0-=0.02;
        hand.setAlpha(fade_power_0);
        play_btn.setAlpha(fade_power_0);
        donuts_label.setAlpha(fade_power_0);
        volume_enable_btn.setAlpha(fade_power_0);
        for(let i=0;i<gem_arr.length;i++)
          gem_arr[i].setAlpha(fade_power_0);
        gem_refresh=true;
      }
    }
}

function render()
{

}

})();

