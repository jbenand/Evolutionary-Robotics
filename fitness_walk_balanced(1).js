//--------FITNESS_STEP_1_BALANCED_LOCOMOTION--------------
{
    // Variables de suivi
    distances: [],
    imuReadings: {
        pitch: []
    },
    pitchPenalty: 0,
    energySpent: 0,
    steps: 0,

    // Fonction de configuration
    setupSimulation: function() {
        this.startPos = this.getRobot().getCoreComponent().getRootPosition();
        this.imuReadings.pitch = [];
        this.pitchPenalty = 0;
        this.energySpent = 0;
        this.steps = 0;
        return true;
    },
    
    // Fonction appelée après chaque étape de simulation
    afterSimulationStep: function() {
        this.steps += 1; // Compter le nombre d'étapes de simulation
        var sensors = this.getRobot().getSensors();
        var motors = this.getRobot().getMotors();
        
        // Calcul de l'énergie dépensée par les moteurs
        for (var i = 0; i < motors.length; i++) {
            var motor = motors[i];
            var torque = motor.getTorque();
            var velocity = motor.getVelocity();
            var energy = torque * velocity * 0.005; // Calcul simplifié de l'énergie
            this.energySpent += energy;
        }

        // Récupération des lectures de l'IMU pour l'axe Y (Pitch)
        for (var i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            if (sensor.getType() == "ImuSensorElement") {
                var pitchValue = sensor.read();
                this.imuReadings.pitch.push(pitchValue);

                // Pénalité pour l'angle de pitch
                var pitchThreshold = 20; // Seuil en degrés
                if (Math.abs(pitchValue) > pitchThreshold) {
                    this.pitchPenalty += 1; // Comptabiliser le dépassement du seuil
                }
            }
        }
        return true;
    },

    // Fonction appelée à la fin de la simulation
    endSimulation: function() {
        var maxFitness = -Number.MAX_VALUE;
        var coreComponent = this.getRobot().getCoreComponent();
        var bodyParts = this.getRobot().getBodyParts();
        var blockCount = bodyParts.length;
        
        var xDiff = coreComponent.getRootPosition().x - this.startPos.x;
        var yDiff = coreComponent.getRootPosition().y - this.startPos.y;
        var zDiff = coreComponent.getRootPosition().z - this.startPos.z;

        // Calcul de la fitness
        var xComponent = (xDiff > 0 ? -Math.abs(xDiff) * 10 : Math.abs(xDiff) * 10);
        var yComponent = (Math.abs(yDiff) > 0 ? -4 * Math.abs(yDiff) : 0); 
		var zComponent = (Math.abs(zDiff) > 0 ? 15 * Math.abs(yDiff) : 0); 
        var fitness = xComponent + yComponent + zComponent;

        // Mise à jour de la fitness maximale
        if (fitness > maxFitness) {
            maxFitness = fitness;
        }

        // Normalisation de l'énergie dépensée par le nombre de blocs
        var normalizedEnergy = this.energySpent / blockCount;

        // Normalisation de la pénalité de pitch par le nombre de dépassements et le nombre d'étapes
        var normalizedPitchPenalty = (this.pitchPenalty / this.steps) * 10;

        // Calcul de la fitness finale
        var finalFitness = maxFitness - normalizedPitchPenalty - normalizedEnergy;
        this.distances.push(finalFitness);

        return true;
    },
    
    // Fonction de calcul de la fitness
    getFitness: function() {
        var fitness = this.distances[0];
        for (var i = 1; i < this.distances.length; i++) {
            if (this.distances[i] > fitness) {
                fitness = this.distances[i];
            }
        }
        return fitness;
    },
}