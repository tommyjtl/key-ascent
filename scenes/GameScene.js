class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        // Debug flags
        this.skipCountdown = false; // Set to true to skip countdown, false to show countdown
        this.playBackgroundMusic = false; // Set to true to play background music, false to mute

        // Background music
        this.backgroundMusic = null;

        // Record tracking
        this.player1Records = [];
        this.player2Records = [];
        this.player1BestTime = null;
        this.player2BestTime = null;
        this.player1BestText = null;
        this.player2BestText = null;

        // Track player completion status
        this.player1Finished = false;
        this.player2Finished = false;
        this.firstToFinish = null; // Track who finished first

        // Victory window properties
        this.victoryWindowWidth = 300;
        this.victoryWindowHeight = 300;
        this.victoryWindowX1 = 350; // Left side position
        this.victoryWindowX2 = 1090; // Right side position
        this.victoryWindowY = 450;

        // Slider properties
        this.sliderWidth = 100; // Width of the slider track
        this.sliderHeight = 20; // Height of the slider track
        this.handleWidth = 30; // Width of the slider handle
        this.handleHeight = 26; // Height of the slider handle
        this.sliderSpeed = 100; // Base speed for slider movement (pixels per second)
        this.sliderSpeedMultiplier = 0.6; // Speed multiplier for higher holds
        this.sliderYOffset = 40; // Vertical offset from the hold position
        this.gripZonePercentage1 = 0.6; // Percentage of track width for first hold's gripping zone
        this.gripZonePercentage2 = 0.15; // Percentage of track width for second hold's gripping zone

        // Track current holds and sliders for each player
        this.player1CurrentHoldIndex = this.holdCoordinates.length - 1; // Start at bottom hold
        this.player2CurrentHoldIndex = this.holdCoordinates.length - 1;
        this.player1Sliders = [];
        this.player2Sliders = [];

        this.player1ThemeColor = 0xaf3131;
        this.player2ThemeColor = 0x1859aa;

        // Available keys for each player
        this.player1Keys = ['q', 'w', 'a', 's', 'z', 'x'];
        this.player2Keys = ['i', 'o', 'j', 'k', 'n', 'm'];
    }

    init(data) {
        // Set default names
        this.player1Name = 'Player 1';
        this.player2Name = 'Player 2';
        this.gameStarted = false;

        // Sort holds by y-coordinate (bottom to top)
        const holdData = this.holdCoordinates.map((coord, index) => ({
            coord: coord,
            gripPoints: this.holdGrippingPoints[index]
        }));

        // Sort by y-coordinate (descending order)
        holdData.sort((a, b) => b.coord[1] - a.coord[1]);

        // Update the arrays with sorted data
        this.holdCoordinates = holdData.map(data => data.coord);
        this.holdGrippingPoints = holdData.map(data => data.gripPoints);

        // Initialize player hand positions
        this.player1Hands = {
            left: { x: 0, y: 0 },
            right: { x: 0, y: 0 }
        };
        this.player2Hands = {
            left: { x: 0, y: 0 },
            right: { x: 0, y: 0 }
        };
    }

    preload() {
        // Load game assets
        this.load.image('background', 'assets/images/background.jpg')
            .on('loaderror', (file) => {
                console.error('Failed to load background image:', file.key);
            })
            .on('complete', () => {
                console.log('Background image loaded successfully');
            });
        this.load.image('wall_left', 'assets/images/wall_left.jpg')
            .on('loaderror', (file) => {
                console.error('Failed to load left wall image:', file.key);
            })
            .on('complete', () => {
                console.log('Left wall image loaded successfully');
            });
        this.load.image('wall_right', 'assets/images/wall_right.jpg')
            .on('loaderror', (file) => {
                console.error('Failed to load right wall image:', file.key);
            })
            .on('complete', () => {
                console.log('Right wall image loaded successfully');
            });
        this.load.spritesheet('fullscreen', 'assets/images/fullscreen.png', { frameWidth: 56, frameHeight: 56 })
            .on('loaderror', (file) => {
                console.error('Failed to load right wall image:', file.key);
            })
            .on('complete', () => {
                console.log('Right wall image loaded successfully');
            });

        // Load background music
        this.load.audio('backgroundMusic', 'assets/audio/chemical-racing-hard-edm-breakbeat-281129.mp3')
            .on('loaderror', (file) => {
                console.error('Failed to load background music:', file.key);
            })
            .on('complete', () => {
                console.log('Background music loaded successfully');
            });
    }

    // Define hold coordinates relative to the bottom-center of the wall image
    // Format: [(x, y), ...] where x and y are relative to wall's bottom-center
    holdCoordinates = [
        // Starting hold
        [113, 241],

        // Rest
        // [-97, 278], // foot chip
        [132, 280],
        [36, 396],
        [-77, 510],
        // [74, 547],
        [-19, 627],
        [35, 679],
        [-17, 778],
        [58, 886],
        // [-78, 848],
        // [94, 847],
        // [-17, 944],
        // [-136, 967],
        [94, 1005],
        [-98, 1079],
        [-38, 1175],
        [-115, 1220],
        [-21, 1330],
        [-113, 1419],
        [-37, 1493],
        [-58, 1533],
        [-154, 1668],
        [25, 1768],
        [97, 1869],
        [-35, 1939],

        // Top hold
        [0, 2197]
    ];

    // Define gripping points for each hold
    // Format: [[[left_x, left_y], [right_x, right_y]], ...]
    // Each pair of coordinates is relative to the hold's position
    holdGrippingPoints = [
        // Starting hold
        [[-10, -10], [10, -10]],

        // Rest
        [[-15, -15], [15, -15]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-15, -15], [15, -15]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],
        [[-10, -10], [10, -10]],
        [[-12, -12], [12, -12]],
        [[-15, -15], [15, -15]],

        // Top hold
        [[-10, -10], [10, -10]]
    ];

    create() {
        // Wait for all images to be loaded before proceeding
        if (!this.textures.exists('background') ||
            !this.textures.exists('wall_left') ||
            !this.textures.exists('wall_right')) {
            console.error('Some images failed to load');
            return;
        }

        // Create background image
        const background = this.add.image(0, 0, 'background');
        if (!background) {
            console.error('Failed to create background image');
            return;
        }
        background.setOrigin(0, 0);

        // Create climbing walls
        this.createClimbingWalls();

        // Create HUD elements
        this.createHUD();

        // Create players
        this.createPlayers();

        // Create holds and sliders
        this.createHolds();

        // Set up input handlers
        this.setupInputHandlers();

        // Create name entry window
        this.createNameEntryWindow();
    }

    createClimbingWalls() {
        // Create left wall
        if (!this.textures.exists('wall_left')) {
            console.error('Left wall texture not found');
            return;
        }
        this.leftWall = this.add.image(455, 816, 'wall_left')
            .setOrigin(0.5, 1) // Set origin to bottom-center
            .setDepth(0); // Place below HUD

        // Create right wall
        if (!this.textures.exists('wall_right')) {
            console.error('Right wall texture not found');
            return;
        }
        this.rightWall = this.add.image(985, 816, 'wall_right')
            .setOrigin(0.5, 1) // Set origin to bottom-center
            .setDepth(0); // Place below HUD

        // Store initial positions for reference
        this.leftWallInitialY = 816;
        this.rightWallInitialY = 816;

        // Movement speed and distance
        this.wallMoveSpeed = 750; // pixels per second
        this.wallMoveDistance = 50; // pixels to move per step

        // Wall boundaries
        this.wallMinY = 816; // Minimum Y position (lowest point)
        this.wallMaxY = 2400; // Maximum Y position (highest point)
        this.wallStepDistance = 250; // Distance to move per step

        // Track current movement state
        this.leftWallMoving = false;
        this.rightWallMoving = false;
    }

    moveWall(wall, direction) {
        const targetWall = wall === 'left' ? this.leftWall : this.rightWall;
        const targetHolds = wall === 'left' ? this.leftWallHolds : this.rightWallHolds;
        const targetHandsContainer = wall === 'left' ? this.player1HandsContainer : this.player2HandsContainer;
        const isLeftWall = wall === 'left';
        const currentY = targetWall.y;

        // Stop any existing tweens on this wall, its holds, and hands
        this.tweens.killTweensOf(targetWall);
        this.tweens.killTweensOf(targetHolds);
        this.tweens.killTweensOf(targetHandsContainer);

        // Calculate target Y position based on direction and boundaries
        let targetY;
        if (direction === 'up') {
            // When pressing up, move wall down (to simulate climbing up)
            targetY = Math.min(currentY + this.wallStepDistance, this.wallMaxY);
        } else {
            // When pressing down, move wall up (to simulate climbing down)
            targetY = Math.max(currentY - this.wallStepDistance, this.wallMinY);
        }

        // Only move if we're not at the boundary
        if (targetY !== currentY) {
            // Create smooth movement tween for wall
            this.tweens.add({
                targets: targetWall,
                y: targetY,
                duration: 1000, // 1 second duration
                ease: 'Power2', // Smooth easing function
                onComplete: () => {
                    // Reset movement state
                    if (isLeftWall) {
                        this.leftWallMoving = false;
                    } else {
                        this.rightWallMoving = false;
                    }
                }
            });

            // Create smooth movement tween for holds
            this.tweens.add({
                targets: targetHolds,
                y: targetY,
                duration: 1000,
                ease: 'Power2'
            });

            // Create smooth movement tween for hands
            this.tweens.add({
                targets: targetHandsContainer,
                y: targetY,
                duration: 1000,
                ease: 'Power2'
            });

            // Set movement state
            if (isLeftWall) {
                this.leftWallMoving = true;
            } else {
                this.rightWallMoving = true;
            }
        }
    }

    createHUD() {
        const button = this.add.image(1440 - 16, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();

        button.on('pointerup', function () {
            if (this.scale.isFullscreen) {
                button.setFrame(0);

                this.scale.stopFullscreen();
            }
            else {
                button.setFrame(1);

                this.scale.startFullscreen();
            }

        }, this);

        // Create player 1 name banner
        const player1BannerCascade = this.add.rectangle(350 + 10, 850 + 10 + 40, 650, 60, this.player1ThemeColor).setDepth(2);
        const player1Banner = this.add.rectangle(350, 850 + 40, 650, 60, 0xc7c7c7).setDepth(2);
        this.player1NameText = this.add.text(50, 850 + 40, this.player1Name.toUpperCase(), {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0, 0.5).setDepth(2);
        const player1BestTextTip = this.add.text(660, 855 + 22, 'PERSONAL BEST', {
            fontSize: '12px',
            fill: '#000',
            fontFamily: 'PPFraktionSans-Light'
        }).setOrigin(1, 0.5).setDepth(2);
        this.player1BestText = this.add.text(660, 855 + 45, '-\'--"---', {
            fontSize: '22px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(1, 0.5).setDepth(2);

        // Create player 2 name banner
        const player2BannerCascade = this.add.rectangle(1090 - 10, 850 + 10 + 40, 650, 60, this.player2ThemeColor).setDepth(2);
        const player2Banner = this.add.rectangle(1090, 850 + 40, 650, 60, 0xc7c7c7).setDepth(2);
        this.player2NameText = this.add.text(1390, 850 + 40, this.player2Name.toUpperCase(), {
            fontSize: '32px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(1, 0.5).setDepth(2);
        const player2BestTextTip = this.add.text(780, 855 + 22, 'PERSONAL BEST', {
            fontSize: '12px',
            fill: '#000',
            fontFamily: 'PPFraktionSans-Light'
        }).setOrigin(0, 0.5).setDepth(2);
        this.player2BestText = this.add.text(780, 855 + 45, '-\'--"---', {
            fontSize: '22px',
            fill: '#000',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0, 0.5).setDepth(2);

        // Create player 1 ticker
        const player1Ticker = this.add.rectangle(111, 770 + 40, 170, 75, this.player1ThemeColor).setDepth(2);
        const player1TickerTextTip = this.add.text(50, 770 + 22, 'CURRENT TIME', {
            fontSize: '12px',
            fill: '#fff',
            fontFamily: 'PPFraktionSans-Light'
        }).setOrigin(0, 0.5).setDepth(2);
        const player1TickerText = this.add.text(50, 770 + 50, '0\'00"000', {
            fontSize: '30px',
            fill: '#fff',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0, 0.5).setDepth(2);

        // Create player 2 ticker
        const player2Ticker = this.add.rectangle(1330, 770 + 40, 170, 75, this.player2ThemeColor).setDepth(2);
        const player2TickerTextTip = this.add.text(1390, 770 + 22, 'CURRENT TIME', {
            fontSize: '12px',
            fill: '#fff',
            fontFamily: 'PPFraktionSans-Light'
        }).setOrigin(1, 0.5).setDepth(2);
        const player2TickerText = this.add.text(1390, 770 + 50, '0\'00"000', {
            fontSize: '30px',
            fill: '#fff',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(1, 0.5).setDepth(2);

        // Store references for later updates
        this.player1TickerText = player1TickerText;
        this.player2TickerText = player2TickerText;

        // Create height bar for Player 1
        this.player1HeightBarBg = this.add.rectangle(50 + 5, 480 + 5, 20, 400, 0x464646).setOrigin(0.5, 0.5).setDepth(2);
        this.player1HeightBar = this.add.rectangle(50, 480, 20, 400, 0xc7c7c7).setOrigin(0.5, 0.5).setDepth(2);
        this.player1HeightIndicator = this.add.rectangle(50, 660, 20, 20, this.player1ThemeColor).setOrigin(0.5, 0).setDepth(3);
        // Add Player 2's indicator to Player 1's height bar
        this.player1HeightBarPlayer2Indicator = this.add.rectangle(50, 660, 15, 15, this.player2ThemeColor).setOrigin(0.5, 0).setDepth(3);

        // Create height bar for Player 2
        this.player2HeightBarBg = this.add.rectangle(1390 + 5, 480 + 5, 20, 400, 0x464646).setOrigin(0.5, 0.5).setDepth(2);
        this.player2HeightBar = this.add.rectangle(1390, 480, 20, 400, 0xc7c7c7).setOrigin(0.5, 0.5).setDepth(2);
        this.player2HeightIndicator = this.add.rectangle(1390, 660, 20, 20, this.player2ThemeColor).setOrigin(0.5, 0).setDepth(3);
        // Add Player 1's indicator to Player 2's height bar
        this.player2HeightBarPlayer1Indicator = this.add.rectangle(1390, 660, 15, 15, this.player1ThemeColor).setOrigin(0.5, 0).setDepth(3);
    }

    createPlayers() {
        // Create player hand containers
        this.player1HandsContainer = this.add.container(455, 816); // Position at left wall's bottom-center
        this.player2HandsContainer = this.add.container(985, 816); // Position at right wall's bottom-center

        // Set depth to be above holds but below HUD
        this.player1HandsContainer.setDepth(1);
        this.player2HandsContainer.setDepth(1);

        // Create hand circles
        this.player1LeftHand = this.add.circle(0, 0, 8, 0xff0000, 1).setStrokeStyle(2, 0xffffff);
        this.player1RightHand = this.add.circle(0, 0, 8, 0xff0000, 1).setStrokeStyle(2, 0xffffff);
        this.player2LeftHand = this.add.circle(0, 0, 8, 0x0000ff, 1).setStrokeStyle(2, 0xffffff);
        this.player2RightHand = this.add.circle(0, 0, 8, 0x0000ff, 1).setStrokeStyle(2, 0xffffff);

        // Add hands to containers
        this.player1HandsContainer.add([this.player1LeftHand, this.player1RightHand]);
        this.player2HandsContainer.add([this.player2LeftHand, this.player2RightHand]);

        // Set initial hand positions to starting hold's gripping points
        const startingHoldIndex = this.holdCoordinates.length - 1; // Last hold is the starting hold
        const startingGripPoints = this.holdGrippingPoints[startingHoldIndex];
        const startingHold = this.holdCoordinates[startingHoldIndex];

        // Set player 1 hands
        this.player1LeftHand.setPosition(
            startingHold[0] + startingGripPoints[0][0],
            -startingHold[1] + startingGripPoints[0][1]
        );
        this.player1RightHand.setPosition(
            startingHold[0] + startingGripPoints[1][0],
            -startingHold[1] + startingGripPoints[1][1]
        );

        // Set player 2 hands
        this.player2LeftHand.setPosition(
            startingHold[0] + startingGripPoints[0][0],
            -startingHold[1] + startingGripPoints[0][1]
        );
        this.player2RightHand.setPosition(
            startingHold[0] + startingGripPoints[1][0],
            -startingHold[1] + startingGripPoints[1][1]
        );

        // Store initial positions
        this.player1Hands.left = {
            x: startingHold[0] + startingGripPoints[0][0],
            y: -startingHold[1] + startingGripPoints[0][1]
        };
        this.player1Hands.right = {
            x: startingHold[0] + startingGripPoints[1][0],
            y: -startingHold[1] + startingGripPoints[1][1]
        };
        this.player2Hands.left = {
            x: startingHold[0] + startingGripPoints[0][0],
            y: -startingHold[1] + startingGripPoints[0][1]
        };
        this.player2Hands.right = {
            x: startingHold[0] + startingGripPoints[1][0],
            y: -startingHold[1] + startingGripPoints[1][1]
        };
    }

    createHolds() {
        // Create containers for holds on each wall
        this.leftWallHolds = this.add.container(455, 816); // Position at left wall's bottom-center
        this.rightWallHolds = this.add.container(985, 816); // Position at right wall's bottom-center

        // Set depth to be below HUD elements
        this.leftWallHolds.setDepth(0);
        this.rightWallHolds.setDepth(0);

        // Draw circles and gripping points at hold positions on both walls
        this.holdCoordinates.forEach((coord, index) => {
            // Add gripping points to left wall
            // this.holdGrippingPoints[index].forEach((gripPoint, gripIndex) => {
            //     const leftGrip = this.add.circle(
            //         coord[0] + gripPoint[0], // hold x + grip point x offset
            //         -coord[1] + gripPoint[1], // hold y + grip point y offset
            //         5, // smaller radius for grip points
            //         gripIndex === 0 ? 0x51ab0f : 0xb616ad, // dark green for left grip, purple for right grip
            //         1 // alpha
            //     ).setStrokeStyle(1, 0xffffff); // white stroke
            //     this.leftWallHolds.add(leftGrip);
            // });

            // // Add gripping points to right wall
            // this.holdGrippingPoints[index].forEach((gripPoint, gripIndex) => {
            //     const rightGrip = this.add.circle(
            //         coord[0] + gripPoint[0], // hold x + grip point x offset
            //         -coord[1] + gripPoint[1], // hold y + grip point y offset
            //         5, // smaller radius for grip points
            //         gripIndex === 0 ? 0x51ab0f : 0xb616ad, // dark green for left grip, purple for right grip
            //         1 // alpha
            //     ).setStrokeStyle(1, 0xffffff); // white stroke
            //     this.rightWallHolds.add(rightGrip);
            // });

            // show the coordinates of the hold in console
            // console.log("hold " + index + ": " + coord[0] + ", " + coord[1]);
        });

        // Create initial sliders for both players
        this.createSlidersForPlayer('player1');
        this.createSlidersForPlayer('player2');
    }

    createSlidersForPlayer(player) {
        const isPlayer1 = player === 'player1';
        const wallHolds = isPlayer1 ? this.leftWallHolds : this.rightWallHolds;
        const currentHoldIndex = isPlayer1 ? this.player1CurrentHoldIndex : this.player2CurrentHoldIndex;
        const playerSliders = isPlayer1 ? this.player1Sliders : this.player2Sliders;
        const availableKeys = isPlayer1 ? this.player1Keys : this.player2Keys;
        const gripZoneColor = isPlayer1 ? 0xff0000 : 0x0000ff; // Red for left wall, blue for right wall

        // Clear existing sliders
        playerSliders.forEach(slider => {
            slider.container.destroy();
        });
        playerSliders.length = 0;

        // Track used keys to avoid duplicates
        const usedKeys = new Set();

        // Create sliders for next two holds
        for (let i = 1; i <= 2; i++) {
            const nextHoldIndex = currentHoldIndex - i;
            if (nextHoldIndex < 0) break; // No more holds above

            const hold = this.holdCoordinates[nextHoldIndex];
            const sliderContainer = this.add.container(0, 0);
            wallHolds.add(sliderContainer);

            // Create slider track background
            const trackBg = this.add.rectangle(
                hold[0], // x position
                -hold[1] - this.sliderYOffset, // y position with offset
                this.sliderWidth,
                this.sliderHeight,
                0xffffff
            ).setStrokeStyle(2, 0x393939);
            sliderContainer.add(trackBg);

            // Create gripping zone with different percentages for each hold
            const gripZonePercentage = i === 1 ? this.gripZonePercentage1 : this.gripZonePercentage2;
            const gripZoneWidth = this.sliderWidth * gripZonePercentage;
            const gripZone = this.add.rectangle(
                hold[0], // x position
                -hold[1] - this.sliderYOffset, // y position with offset
                gripZoneWidth,
                this.sliderHeight,
                gripZoneColor
            ).setAlpha(0.3); // Semi-transparent
            sliderContainer.add(gripZone);

            // Create slider handle
            const handle = this.add.rectangle(
                hold[0], // x position
                -hold[1] - this.sliderYOffset, // y position with offset
                this.handleWidth,
                this.handleHeight,
                0xffffff
            ).setStrokeStyle(2, 0x393939);
            sliderContainer.add(handle);

            // Select random keys that haven't been used yet
            let key1, key2;
            let attempts = 0;
            const maxAttempts = 10; // Prevent infinite loop

            do {
                key1 = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                key2 = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                attempts++;
            } while ((usedKeys.has(key1) || usedKeys.has(key2) || key1 === key2) && attempts < maxAttempts);

            // If we couldn't find unused keys, use the first available ones
            if (attempts >= maxAttempts) {
                const unusedKeys = availableKeys.filter(key => !usedKeys.has(key));
                key1 = unusedKeys[0] || availableKeys[0];
                key2 = unusedKeys[1] || availableKeys[1];
            }

            // Mark these keys as used
            usedKeys.add(key1);
            usedKeys.add(key2);

            // Add first key text to handle
            const keyText1 = this.add.text(
                hold[0] - 5, // x position, slightly left
                -hold[1] - this.sliderYOffset, // y position with offset
                key1.toUpperCase(),
                {
                    fontSize: '16px',
                    fill: '#393939',
                    fontFamily: 'PPFraktionSans'
                }
            ).setOrigin(0.5);
            sliderContainer.add(keyText1);

            // Add second key text to handle
            const keyText2 = this.add.text(
                hold[0] + 5, // x position, slightly right
                -hold[1] - this.sliderYOffset, // y position with offset
                key2.toUpperCase(),
                {
                    fontSize: '16px',
                    fill: '#393939',
                    fontFamily: 'PPFraktionSans'
                }
            ).setOrigin(0.5);
            sliderContainer.add(keyText2);

            // Store slider data
            playerSliders.push({
                container: sliderContainer,
                track: trackBg,
                gripZone: gripZone,
                handle: handle,
                keyText1: keyText1,
                keyText2: keyText2,
                keyPair: [key1, key2],
                holdIndex: nextHoldIndex,
                direction: 1, // 1 for right, -1 for left
                speed: this.sliderSpeed * (1 + (i - 1) * this.sliderSpeedMultiplier),
                firstKeyPressed: false,
                secondKeyPressed: false
            });
        }
    }

    setupInputHandlers() {
        // Left wall controls
        this.input.keyboard.on('keydown-ONE', () => {
            this.moveWall('left', 'up');
        });
        this.input.keyboard.on('keydown-TWO', () => {
            this.moveWall('left', 'down');
        });
        this.input.keyboard.on('keydown-THREE', () => {
            this.resetWall('left');
        });
        this.input.keyboard.on('keydown-FOUR', () => {
            this.moveWallToTop('left');
        });

        // Right wall controls
        this.input.keyboard.on('keydown-NINE', () => {
            this.moveWall('right', 'up');
        });
        this.input.keyboard.on('keydown-ZERO', () => {
            this.moveWall('right', 'down');
        });
        this.input.keyboard.on('keydown-EIGHT', () => {
            this.resetWall('right');
        });
        this.input.keyboard.on('keydown-SEVEN', () => {
            this.moveWallToTop('right');
        });
    }

    resetWall(wall) {
        const targetWall = wall === 'left' ? this.leftWall : this.rightWall;
        const targetHolds = wall === 'left' ? this.leftWallHolds : this.rightWallHolds;
        const targetHandsContainer = wall === 'left' ? this.player1HandsContainer : this.player2HandsContainer;
        const initialY = wall === 'left' ? this.leftWallInitialY : this.rightWallInitialY;

        // Stop any existing tweens on this wall, its holds, and hands
        this.tweens.killTweensOf(targetWall);
        this.tweens.killTweensOf(targetHolds);
        this.tweens.killTweensOf(targetHandsContainer);

        // Create smooth movement tween back to initial position for wall
        this.tweens.add({
            targets: targetWall,
            y: initialY,
            duration: 1000, // 1 second duration
            ease: 'Power2', // Smooth easing function
            onComplete: () => {
                // Reset movement state
                if (wall === 'left') {
                    this.leftWallMoving = false;
                } else {
                    this.rightWallMoving = false;
                }
            }
        });

        // Create smooth movement tween for holds
        this.tweens.add({
            targets: targetHolds,
            y: initialY,
            duration: 1000,
            ease: 'Power2'
        });

        // Create smooth movement tween for hands
        this.tweens.add({
            targets: targetHandsContainer,
            y: initialY,
            duration: 1000,
            ease: 'Power2'
        });

        // Set movement state
        if (wall === 'left') {
            this.leftWallMoving = true;
        } else {
            this.rightWallMoving = true;
        }
    }

    moveWallToTop(wall) {
        const targetWall = wall === 'left' ? this.leftWall : this.rightWall;
        const targetHolds = wall === 'left' ? this.leftWallHolds : this.rightWallHolds;
        const targetHandsContainer = wall === 'left' ? this.player1HandsContainer : this.player2HandsContainer;
        const isLeftWall = wall === 'left';

        // Stop any existing tweens on this wall, its holds, and hands
        this.tweens.killTweensOf(targetWall);
        this.tweens.killTweensOf(targetHolds);
        this.tweens.killTweensOf(targetHandsContainer);

        // Create smooth movement tween to top for wall
        this.tweens.add({
            targets: targetWall,
            y: this.wallMaxY,
            duration: 1000, // 1 second duration
            ease: 'Power2', // Smooth easing function
            onComplete: () => {
                // Reset movement state
                if (isLeftWall) {
                    this.leftWallMoving = false;
                } else {
                    this.rightWallMoving = false;
                }
            }
        });

        // Create smooth movement tween for holds
        this.tweens.add({
            targets: targetHolds,
            y: this.wallMaxY,
            duration: 1000,
            ease: 'Power2'
        });

        // Create smooth movement tween for hands
        this.tweens.add({
            targets: targetHandsContainer,
            y: this.wallMaxY,
            duration: 1000,
            ease: 'Power2'
        });

        // Set movement state
        if (isLeftWall) {
            this.leftWallMoving = true;
        } else {
            this.rightWallMoving = true;
        }
    }

    createNameEntryWindow() {
        // Create a semi-transparent background
        const overlay = this.add.rectangle(720, 480, 1440, 960, 0x000000, 0.5).setDepth(9);
        const bgCascade = this.add.rectangle(720, 450, 600 + 20, 400 + 20, 0x393939, 1.).setDepth(10);
        const bg = this.add.rectangle(720, 450, 600, 400, 0xffffff, 1.).setDepth(10);

        // Create title
        const titleText = this.add.text(720, 295, 'KEY ASCENT', {
            fontSize: '30px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0.5).setDepth(10);

        // Create input boxes
        const inputLabelStyle = {
            fontSize: '22px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans',
            // backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        };
        const inputBoxStyle = {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'PPFraktionSans',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        };

        // Player 1 input
        const player1Label = this.add.text(720, 365, 'Enter Player 1 Name:', inputLabelStyle).setOrigin(0.5, 0.5).setDepth(10);
        const player1Input = this.add.text(720, 410, this.player1Name, inputBoxStyle)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(10);

        // Player 2 input
        const player2Label = this.add.text(720, 465, 'Enter Player 2 Name:', inputLabelStyle).setOrigin(0.5, 0.5).setDepth(10);
        const player2Input = this.add.text(720, 510, this.player2Name, inputBoxStyle)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(10);

        // Create start button
        const startButtonBg = this.add.rectangle(720, 590, 200, 50, 0xffffff)
            .setStrokeStyle(1, 0x393939)
            .setDepth(10);
        const startButton = this.add.text(720, 590, 'Start Match', {
            fontSize: '22px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans'
        })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(10);

        // Add hover effects
        [player1Input, player2Input, startButton].forEach(element => {
            element.on('pointerover', () => {
                if (element === startButton) {
                    startButtonBg.setFillStyle(0xf0f0f0);
                } else {
                    element.setBackgroundColor('#444444');
                }
            });
            element.on('pointerout', () => {
                if (element === startButton) {
                    startButtonBg.setFillStyle(0xffffff);
                } else {
                    element.setBackgroundColor('#333333');
                }
            });
        });

        // Handle input clicks
        let activeInput = null;
        [player1Input, player2Input].forEach(input => {
            input.on('pointerdown', () => {
                activeInput = input;
                input.setBackgroundColor('#444444');
                // Clear the input text when clicked
                input.setText('');
            });
        });

        // Handle keyboard input
        this.keyboardListener = this.input.keyboard.on('keydown', (event) => {
            if (activeInput) {
                if (event.key === 'Enter') {
                    activeInput.setBackgroundColor('#333333');
                    activeInput = null;
                } else if (event.key === 'Backspace') {
                    const text = activeInput.text;
                    if (text.length > 0) {
                        activeInput.setText(text.slice(0, -1));
                    }
                } else if (event.key.length === 1) {
                    activeInput.setText(activeInput.text + event.key);
                }
            }
        });

        // Handle start button click
        startButton.on('pointerdown', () => {
            // Update player names
            this.player1Name = player1Input.text;
            this.player2Name = player2Input.text;

            // Update HUD text
            this.player1NameText.setText(this.player1Name.toUpperCase());
            this.player2NameText.setText(this.player2Name.toUpperCase());

            // Remove keyboard listener
            this.input.keyboard.removeListener('keydown', this.keyboardListener);

            // Remove name entry window
            [overlay, bgCascade, bg, titleText, player1Label, player1Input, player2Label, player2Input, startButton, startButtonBg].forEach(element => {
                element.destroy();
            });

            // Start background music if the toggle is enabled
            if (this.playBackgroundAudio && this.cache.audio.exists('backgroundMusic')) {
                this.backgroundMusic = this.sound.add('backgroundMusic', {
                    loop: true,
                    volume: 0.5 // Adjust volume as needed (0.0 to 1.0)
                });
                this.backgroundMusic.play();
            } else if (!this.playBackgroundAudio) {
                console.log('Background audio is disabled.');
            } else {
                console.error('Background music not found in cache');
            }

            // Create countdown window
            this.createCountdownWindow();
        });
    }

    createCountdownWindow() {
        // Create a semi-transparent background
        // const overlay = this.add.rectangle(720, 480, 1440, 960, 0x000000, 0.5).setDepth(9);
        const bgCascade = this.add.rectangle(720, 450, 400 + 20, 200 + 20, 0x393939, 1.).setDepth(10);
        const bg = this.add.rectangle(720, 450, 400, 200, 0xffffff, 1.).setDepth(10);

        // Create countdown text
        const countdownText = this.add.text(720, 450, '3', {
            fontSize: '72px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0.5).setDepth(10);

        // Store elements to destroy later
        const elements = [bgCascade, bg, countdownText];

        // Countdown sequence
        const countdown = () => {
            if (this.skipCountdown) {
                // If countdown is skipped, start game immediately
                elements.forEach(element => element.destroy());
                this.gameStarted = true;
                this.startTime = Date.now();
                return;
            }

            let count = 3;
            const updateCountdown = () => {
                if (count > 0) {
                    countdownText.setText(count.toString());
                    count--;
                    this.time.delayedCall(1000, updateCountdown);
                } else {
                    countdownText.setText('GO!');
                    this.time.delayedCall(500, () => {
                        elements.forEach(element => element.destroy());
                        this.gameStarted = true;
                        this.startTime = Date.now();
                    });
                }
            };
            updateCountdown();
        };

        // Start countdown after a short delay
        this.time.delayedCall(500, countdown);
    }

    update() {
        // Only update timer and sliders if game has started
        if (this.gameStarted) {
            // Update timer
            const elapsedTime = (Date.now() - this.startTime) / 1000;
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = Math.floor(elapsedTime % 60);
            const milliseconds = Math.floor((elapsedTime % 1) * 1000);
            const timeString = `${minutes}\'${seconds.toString().padStart(2, '0')}"${milliseconds.toString().padStart(3, '0')}`;

            // Only update ticker text for players who haven't finished
            if (!this.player1Finished) {
                this.player1TickerText.setText(timeString);
            }
            if (!this.player2Finished) {
                this.player2TickerText.setText(timeString);
            }

            // Update sliders
            this.updateSliders(this.player1Sliders);
            this.updateSliders(this.player2Sliders);

            // Update height indicators based on player progress
            this.totalHeight = this.holdCoordinates[this.holdCoordinates.length - 1][1] - this.holdCoordinates[0][1];

            // Update Player 1 height indicator
            this.player1Progress = (this.holdCoordinates[this.holdCoordinates.length - 1][1] - this.holdCoordinates[this.player1CurrentHoldIndex][1]) / this.totalHeight;
            this.player1HeightIndicator.y = 660 - (400 * this.player1Progress);
            // Update Player 2's indicator on Player 1's height bar
            this.player2Progress = (this.holdCoordinates[this.holdCoordinates.length - 1][1] - this.holdCoordinates[this.player2CurrentHoldIndex][1]) / this.totalHeight;
            this.player1HeightBarPlayer2Indicator.y = 660 - (400 * this.player2Progress);

            // Update Player 2 height indicator
            this.player2Progress = (this.holdCoordinates[this.holdCoordinates.length - 1][1] - this.holdCoordinates[this.player2CurrentHoldIndex][1]) / this.totalHeight;
            this.player2HeightIndicator.y = 660 - (400 * this.player2Progress);
            // Update Player 1's indicator on Player 2's height bar
            this.player1Progress = (this.holdCoordinates[this.holdCoordinates.length - 1][1] - this.holdCoordinates[this.player1CurrentHoldIndex][1]) / this.totalHeight;
            this.player2HeightBarPlayer1Indicator.y = 660 - (400 * this.player1Progress);

            // console.log(`P1 H: ${player1Progress}, P2 H: ${player2Progress}`);
        }
    }

    updateSliders(sliders) {
        const deltaTime = this.game.loop.delta / 1000; // Convert to seconds

        sliders.forEach(slider => {
            const hold = this.holdCoordinates[slider.holdIndex];
            const trackLeft = hold[0] - this.sliderWidth / 2;
            const trackRight = hold[0] + this.sliderWidth / 2;
            const handleLeft = slider.handle.x - this.handleWidth / 2;
            const handleRight = slider.handle.x + this.handleWidth / 2;

            // Move handle
            slider.handle.x += slider.speed * slider.direction * deltaTime;
            slider.keyText1.x = slider.handle.x - 5;
            slider.keyText2.x = slider.handle.x + 5;

            // Check boundaries and reverse direction if needed
            if (handleRight >= trackRight) {
                slider.direction = -1;
            } else if (handleLeft <= trackLeft) {
                slider.direction = 1;
            }

            // Check if handle is in gripping zone
            const gripZoneLeft = hold[0] - (this.sliderWidth * (slider.holdIndex === this.player1CurrentHoldIndex - 1 ? this.gripZonePercentage1 : this.gripZonePercentage2)) / 2;
            const gripZoneRight = hold[0] + (this.sliderWidth * (slider.holdIndex === this.player1CurrentHoldIndex - 1 ? this.gripZonePercentage1 : this.gripZonePercentage2)) / 2;
            const isInGripZone = slider.handle.x >= gripZoneLeft && slider.handle.x <= gripZoneRight;

            // Handle key presses
            if (isInGripZone) {
                // Check for first key press
                if (!slider.firstKeyPressed && this.input.keyboard.checkDown(this.input.keyboard.addKey(slider.keyPair[0]), 0)) {
                    slider.firstKeyPressed = true;
                    slider.keyText1.setColor('#00ff00'); // Green color for pressed key

                    // Move left hand to the next hold's left gripping point
                    const isPlayer1 = this.player1Sliders.includes(slider);
                    const playerHandsContainer = isPlayer1 ? this.player1HandsContainer : this.player2HandsContainer;
                    const playerLeftHand = isPlayer1 ? this.player1LeftHand : this.player2LeftHand;
                    const currentHoldIndex = isPlayer1 ? this.player1CurrentHoldIndex : this.player2CurrentHoldIndex;

                    // Store the current left hand position in case of failure
                    slider.originalLeftHandPos = {
                        x: playerLeftHand.x,
                        y: playerLeftHand.y
                    };

                    // Move left hand to the next hold's left gripping point
                    const nextHold = this.holdCoordinates[slider.holdIndex];
                    const nextGripPoints = this.holdGrippingPoints[slider.holdIndex];
                    playerLeftHand.setPosition(
                        nextHold[0] + nextGripPoints[0][0],
                        -nextHold[1] + nextGripPoints[0][1]
                    );
                }

                // Check for second key press
                if (slider.firstKeyPressed && !slider.secondKeyPressed && this.input.keyboard.checkDown(this.input.keyboard.addKey(slider.keyPair[1]), 0)) {
                    slider.secondKeyPressed = true;
                    slider.keyText2.setColor('#00ff00'); // Green color for pressed key

                    // Handle successful grip
                    this.handleSuccessfulGrip(slider);
                }
            } else {
                // Reset key press states when not in grip zone
                if (slider.firstKeyPressed) {
                    // Move left hand back to original position if first key was pressed
                    const isPlayer1 = this.player1Sliders.includes(slider);
                    const playerLeftHand = isPlayer1 ? this.player1LeftHand : this.player2LeftHand;
                    if (slider.originalLeftHandPos) {
                        playerLeftHand.setPosition(
                            slider.originalLeftHandPos.x,
                            slider.originalLeftHandPos.y
                        );
                    }
                }
                slider.firstKeyPressed = false;
                slider.secondKeyPressed = false;
                slider.keyText1.setColor('#393939');
                slider.keyText2.setColor('#393939');
            }
        });
    }

    moveWallByDistance(wall, distance) {
        const targetWall = wall === 'left' ? this.leftWall : this.rightWall;
        const targetHolds = wall === 'left' ? this.leftWallHolds : this.rightWallHolds;
        const targetHandsContainer = wall === 'left' ? this.player1HandsContainer : this.player2HandsContainer;
        const isLeftWall = wall === 'left';
        const currentY = targetWall.y;

        // Stop any existing tweens on this wall, its holds, and hands
        this.tweens.killTweensOf(targetWall);
        this.tweens.killTweensOf(targetHolds);
        this.tweens.killTweensOf(targetHandsContainer);

        // Calculate target Y position
        const targetY = currentY + distance;

        // Only move if we're not at the boundary
        if (targetY >= this.wallMinY && targetY <= this.wallMaxY) {
            // Create smooth movement tween for wall
            this.tweens.add({
                targets: targetWall,
                y: targetY,
                duration: 1000, // 1 second duration
                ease: 'Power2', // Smooth easing function
                onComplete: () => {
                    // Reset movement state
                    if (isLeftWall) {
                        this.leftWallMoving = false;
                    } else {
                        this.rightWallMoving = false;
                    }
                }
            });

            // Create smooth movement tween for holds
            this.tweens.add({
                targets: targetHolds,
                y: targetY,
                duration: 1000,
                ease: 'Power2'
            });

            // Create smooth movement tween for hands
            this.tweens.add({
                targets: targetHandsContainer,
                y: targetY,
                duration: 1000,
                ease: 'Power2'
            });

            // Set movement state
            if (isLeftWall) {
                this.leftWallMoving = true;
            } else {
                this.rightWallMoving = true;
            }
        }
    }

    // moveWallsByDistance(distance) {
    //     this.moveWallByDistance('left', distance);
    //     this.moveWallByDistance('right', distance);
    // }

    showVictoryWindow(isPlayer1) {
        const x = isPlayer1 ? this.victoryWindowX1 : this.victoryWindowX2;
        const color = isPlayer1 ? this.player1ThemeColor : this.player2ThemeColor;
        const playerName = isPlayer1 ? this.player1Name : this.player2Name;

        // Create victory window background
        const bgCascade = this.add.rectangle(x, this.victoryWindowY, this.victoryWindowWidth + 20, this.victoryWindowHeight + 20, 0x393939)
            .setDepth(10);
        const bg = this.add.rectangle(x, this.victoryWindowY, this.victoryWindowWidth, this.victoryWindowHeight, color)
            .setDepth(10);

        // Create victory text
        const victoryText = this.add.text(x, this.victoryWindowY - 80, 'VICTORY!', {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0.5).setDepth(10);

        // Create player name text
        const playerText = this.add.text(x, this.victoryWindowY - 5, playerName.toUpperCase(), {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'PPFraktionSans'
        }).setOrigin(0.5).setDepth(10);

        // Create rematch button
        const rematchButtonBg = this.add.rectangle(x, this.victoryWindowY + 80, 200, 50, 0xffffff)
            .setStrokeStyle(1, 0x393939)
            .setDepth(10)
            .setInteractive();
        const rematchButton = this.add.text(x, this.victoryWindowY + 80, 'REMATCH', {
            fontSize: '22px',
            fill: '#393939',
            fontFamily: 'PPFraktionSans'
        })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(10);

        // Add hover effects
        rematchButtonBg.on('pointerover', () => {
            rematchButtonBg.setFillStyle(0xf0f0f0);
        });
        rematchButtonBg.on('pointerout', () => {
            rematchButtonBg.setFillStyle(0xffffff);
        });

        // Handle rematch button click
        rematchButtonBg.on('pointerdown', () => {
            this.resetGame();
        });

        // Store references to destroy later
        this.victoryWindow = {
            bgCascade,
            bg,
            victoryText,
            playerText,
            rematchButtonBg,
            rematchButton
        };
    }

    resetGame() {
        // Destroy victory window
        if (this.victoryWindow) {
            Object.values(this.victoryWindow).forEach(element => element.destroy());
            this.victoryWindow = null;
        }

        // Reset game state
        this.gameStarted = false;
        this.startTime = null;
        this.player1Finished = false;
        this.player2Finished = false;
        this.firstToFinish = null;

        // Reset player positions
        this.player1CurrentHoldIndex = this.holdCoordinates.length - 1;
        this.player2CurrentHoldIndex = this.holdCoordinates.length - 1;

        // Reset walls to initial positions
        this.resetWall('left');
        this.resetWall('right');

        // Reset sliders
        this.createSlidersForPlayer('player1');
        this.createSlidersForPlayer('player2');

        // Reset hand positions
        const startingHoldIndex = this.holdCoordinates.length - 1;
        const startingGripPoints = this.holdGrippingPoints[startingHoldIndex];
        const startingHold = this.holdCoordinates[startingHoldIndex];

        // Reset player 1 hands
        this.player1LeftHand.setPosition(
            startingHold[0] + startingGripPoints[0][0],
            -startingHold[1] + startingGripPoints[0][1]
        );
        this.player1RightHand.setPosition(
            startingHold[0] + startingGripPoints[1][0],
            -startingHold[1] + startingGripPoints[1][1]
        );

        // Reset player 2 hands
        this.player2LeftHand.setPosition(
            startingHold[0] + startingGripPoints[0][0],
            -startingHold[1] + startingGripPoints[0][1]
        );
        this.player2RightHand.setPosition(
            startingHold[0] + startingGripPoints[1][0],
            -startingHold[1] + startingGripPoints[1][1]
        );

        // Reset ticker texts
        this.player1TickerText.setText('0\'00"000');
        this.player2TickerText.setText('0\'00"000');

        // Create countdown window
        this.createCountdownWindow();
    }

    handleSuccessfulGrip(slider) {
        // Determine which player this slider belongs to
        const isPlayer1 = this.player1Sliders.includes(slider);
        const playerName = isPlayer1 ? this.player1Name : this.player2Name;
        const currentHoldIndex = isPlayer1 ? this.player1CurrentHoldIndex : this.player2CurrentHoldIndex;
        const playerHandsContainer = isPlayer1 ? this.player1HandsContainer : this.player2HandsContainer;
        const playerLeftHand = isPlayer1 ? this.player1LeftHand : this.player2LeftHand;
        const playerRightHand = isPlayer1 ? this.player1RightHand : this.player2RightHand;

        // Determine if this is the next hold or the one after
        const holdDistance = currentHoldIndex - slider.holdIndex;
        const holdType = holdDistance === 1 ? "next hold" : "hold after next";

        // Check if the player has failed (if they're trying to grip a hold that's not the next one or the one after)
        const hasFailed = holdDistance > 2;

        console.log(`${playerName} successfully gripped the ${holdType} (Hold ${slider.holdIndex})`);
        console.log(`current height progress: ${this.player1Progress}, ${this.player2Progress}`);

        if (hasFailed) {
            console.log(`${playerName} has failed! They tried to grip a hold that's too far away.`);
            // Move left hand back to original position
            if (slider.originalLeftHandPos) {
                playerLeftHand.setPosition(
                    slider.originalLeftHandPos.x,
                    slider.originalLeftHandPos.y
                );
            }
            return;
        }

        // Calculate the vertical distance between the current hold and the gripped hold
        const currentHold = this.holdCoordinates[currentHoldIndex];
        const grippedHold = this.holdCoordinates[slider.holdIndex];
        const verticalDistance = grippedHold[1] - currentHold[1];

        // Move only the wall corresponding to the player who gripped
        this.moveWallByDistance(isPlayer1 ? 'left' : 'right', verticalDistance);

        // Update current hold index
        if (isPlayer1) {
            this.player1CurrentHoldIndex = slider.holdIndex;
        } else {
            this.player2CurrentHoldIndex = slider.holdIndex;
        }

        // Check if player has reached the top hold (index 0)
        if (slider.holdIndex === 0) {
            const elapsedTime = (Date.now() - this.startTime) / 1000;
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = Math.floor(elapsedTime % 60);
            const milliseconds = Math.floor((elapsedTime % 1) * 1000);
            const timeString = `${minutes}\'${seconds.toString().padStart(2, '0')}"${milliseconds.toString().padStart(3, '0')}`;

            // Add record to player's record list
            if (isPlayer1) {
                this.player1Records.push(elapsedTime);
                // Update personal best if this is the first record or better than current best
                if (!this.player1BestTime || elapsedTime < this.player1BestTime) {
                    this.player1BestTime = elapsedTime;
                    this.player1BestText.setText(timeString);
                }
                this.player1Finished = true;
            } else {
                this.player2Records.push(elapsedTime);
                // Update personal best if this is the first record or better than current best
                if (!this.player2BestTime || elapsedTime < this.player2BestTime) {
                    this.player2BestTime = elapsedTime;
                    this.player2BestText.setText(timeString);
                }
                this.player2Finished = true;
            }

            // Stop the ticker for this player
            if (isPlayer1) {
                this.player1TickerText.setText(timeString);
            } else {
                this.player2TickerText.setText(timeString);
            }

            // Check if this is the first player to finish
            if (!this.firstToFinish) {
                this.firstToFinish = isPlayer1 ? 'player1' : 'player2';
                this.showVictoryWindow(isPlayer1);
            }

            console.log(`${playerName} has reached the top! Time: ${timeString}`);
        }

        // Update hand positions to the gripped hold's gripping points
        const grippedGripPoints = this.holdGrippingPoints[slider.holdIndex];

        // Update left hand position
        playerLeftHand.setPosition(
            grippedHold[0] + grippedGripPoints[0][0],
            -grippedHold[1] + grippedGripPoints[0][1]
        );

        // Update right hand position
        playerRightHand.setPosition(
            grippedHold[0] + grippedGripPoints[1][0],
            -grippedHold[1] + grippedGripPoints[1][1]
        );

        // Update stored hand positions
        if (isPlayer1) {
            this.player1Hands.left = {
                x: grippedHold[0] + grippedGripPoints[0][0],
                y: -grippedHold[1] + grippedGripPoints[0][1]
            };
            this.player1Hands.right = {
                x: grippedHold[0] + grippedGripPoints[1][0],
                y: -grippedHold[1] + grippedGripPoints[1][1]
            };
        } else {
            this.player2Hands.left = {
                x: grippedHold[0] + grippedGripPoints[0][0],
                y: -grippedHold[1] + grippedGripPoints[0][1]
            };
            this.player2Hands.right = {
                x: grippedHold[0] + grippedGripPoints[1][0],
                y: -grippedHold[1] + grippedGripPoints[1][1]
            };
        }

        // Create new sliders for the next holds
        this.createSlidersForPlayer(isPlayer1 ? 'player1' : 'player2');
    }
}