{
    // Variables de suivi
    distances: [],
    imuReadings: {
        pitch: []
    },
    energySpent: 0,
    
    // Fonction de configuration
    setupSimulation: function() {
        this.startPos = this.getRobot().getCoreComponent().getRootPosition();
        this.imuReadings.pitch = [];
        this.energySpent = 0;
        return true;
    },
    
    // Fonction appelée après chaque étape de simulation
    afterSimulationStep: function() {
        var sensors = this.getRobot().getSensors();
        var motors = this.getRobot().getMotors();
        
        // Calcul de l'énergie dépensée par les moteurs
        for (var i = 0; i < motors.length; i++) {
            var motor = motors[i];
            var torque = motor.getTorque();
            var velocity = motor.getVelocity();
            var energy = torque * velocity * 0.1; // Simplified energy calculation
            this.energySpent += energy;
        }
        
        // Récupération des lectures de l'IMU pour l'axe Y (Pitch)
        for (var i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            if (sensor.getType() == "ImuSensorElement") {
                var label = sensor.getLabel();
                if (/Pitch$/.test(label)) {
                    this.imuReadings.pitch.push(sensor.read());
                }
            }
        }
        return true;
    },
    
    // Fonction appelée à la fin de la simulation
    endSimulation: function() {
        var minDistance = Number.MAX_VALUE;
        var imuPenalty = 0;
        var threshold = 30; // Seuil en degrés pour l'angle de Pitch
        var bodyParts = this.getRobot().getBodyParts();
        var blockCount = bodyParts.length;

        // Calcul des distances
        for (var i = 0; i < bodyParts.length; i++) {
            var xDiff = (bodyParts[i].getRootPosition().x - this.startPos.x);
            var yDiff = (bodyParts[i].getRootPosition().y - this.startPos.y);
            var zDiff = (bodyParts[i].getRootPosition().z - this.startPos.z);

            // Calcul de la fitness
            var xComponent = (xDiff > 0 ? -Math.abs(xDiff) * 10 : Math.abs(xDiff) * 10);
            var yComponent = (Math.abs(yDiff) <= 0.5 ? 2 : -10*Math.abs(yDiff));
            var zComponent = (zDiff > 0 ? zDiff * 20 : -Math.abs(zDiff) * 20);

            var fitness = xComponent + yComponent + zComponent;

            // Print components for debugging
            console.log(`xDiff: ${xDiff}, yDiff: ${yDiff}, zDiff: ${zDiff}`);
            console.log(`xComponent: ${xComponent}, yComponent: ${yComponent}, zComponent: ${zComponent}`);
            console.log(`Fitness: ${fitness}`);
            
            // Mise à jour de la fitness minimale
            if (fitness < minDistance) {
                minDistance = fitness;
            }
        }

        // Calcul de la pénalité pour les angles de Pitch dépassant le seuil
        for (var i = 0; i < this.imuReadings.pitch.length; i++) {
            if (Math.abs(this.imuReadings.pitch[i]) > threshold) {
                imuPenalty += 5;
            }
        }

        // Print IMU penalty for debugging
        console.log(`IMU Penalty: ${imuPenalty}`);

        // Normalisation de l'énergie dépensée par le nombre de blocs
        var normalizedEnergy = this.energySpent / blockCount;

        // Print energy spent for debugging
        console.log(`Energy Spent: ${this.energySpent}, Normalized Energy: ${normalizedEnergy}`);

        // Calcul de la fitness finale
        var finalFitness = minDistance - imuPenalty - normalizedEnergy;
        this.distances.push(finalFitness);

        // Print final fitness for debugging
        console.log(`Final Fitness: ${finalFitness}`);

        return true;
    },
    
    // Fonction de calcul de la fitness
    getFitness: function() {
        var fitness = this.distances[0];
        for (var i = 1; i < this.distances.length; i++) {
            if (this.distances[i] < fitness) {
                fitness = this.distances[i];
            }
        }
        return fitness;
    },
}
