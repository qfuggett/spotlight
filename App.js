import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spotlight } from './src/features/spotlight/Spotlight';
import { Timer } from './src/features/timer/Timer';
import { SpotlightHistory } from './src/features/spotlight/SpotlightHistory';

import { colors } from './src/utils/colors';
import { spacing } from './src/utils/sizes';

const STATUSES = {
  COMPLETE: 1,
  CANCELLED: 2
};

export default function App() {
  //A piece of state that holds the thing we are spotlighting
  const [spotlightSubject, setSpotlightSubject] = useState(null);
  //saves the subjects in a list
  const [spotlightHistory, setSpotlightHistory] = useState([]);
  //
  const addSpotlightHistorySubjectWithStatus = (subject, status) => {
    setSpotlightHistory([...spotlightHistory, { key: String(spotlightHistory.length + 1), subject, status }])
  };
  //
  const onClear = () => {
    setSpotlightHistory([]);
  };

  const saveSpotlightHistory = async () => {
    try {
      await AsyncStorage.setItem("spotlightHistory", JSON.stringify(spotlightHistory));
    } catch(e) {
      console.log(e);
    }
  };

  const loadSpotlightHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("spotlightHistory");

      if(history && JSON.parse(history).length) {
        setSpotlightHistory(JSON.parse(history));
      }
    } catch(e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadSpotlightHistory();
  }, [])

  useEffect(() => {
    saveSpotlightHistory();
  }, [spotlightHistory])

  //If we have something in state (our focus subject), show the timer, otherwise, create a focus subject
  return (
    <View style={styles.container}>
      {spotlightSubject ? (
        <Timer 
        spotlightSubject={spotlightSubject} 
        onTimerEnd={() => {
          addSpotlightHistorySubjectWithStatus(spotlightSubject, STATUSES.COMPLETE)
          setSpotlightSubject(null);
          }}
        clearSubject={() => {
          addSpotlightHistorySubjectWithStatus(spotlightSubject, STATUSES.CANCELLED)
          setSpotlightSubject(null)}
        }
        />
      ) : (
        <View style={{ flex: 1 }}>
        <Spotlight addSubject={setSpotlightSubject}/>
        <SpotlightHistory spotlightHistory={spotlightHistory} onClear={onClear}/>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBlue,
    padding: Platform.OS === 'ios' ? spacing.md : spacing.lg,
  },
});
