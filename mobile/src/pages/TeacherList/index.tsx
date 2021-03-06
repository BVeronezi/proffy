import React, { useCallback, useState } from 'react';
import { Text, View, Keyboard } from 'react-native';
import {
  RectButton,
  ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import PageHeader from '../../components/PageHeader';
import TeacherItem, { ClassInfo } from '../../components/TeacherItem';

import Favorites from '../../services/Favorites';
import api from '../../services/api';

import styles from './styles';

export default function TeacherList() {
  const [filtersIsVisible, setFiltersIsVisible] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    'Preencha os filtros para carregar.'
  );
  const [favorites, setFavorites] = useState<Number[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subject, setSubject] = useState('');
  const [weekday, setWeekday] = useState('');
  const [time, setTime] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  function toggleFiltersIsVisible() {
    setFiltersIsVisible(!filtersIsVisible);
  }
  async function loadFavorites() {
    const favorites = await Favorites.getFavorites();
    setFavorites(favorites.map((favorite) => favorite.user_id));
  }
  async function searchClasses() {
    Keyboard.dismiss();
    if (!subject || !weekday || !time) {
      setEmptyMessage('Selecione todos os filtros para pesquisar.');
      return;
    }

    setClasses([]);
    setEmptyMessage('Pesquisando.');
    await loadFavorites();
    api
      .get('classes', {
        params: {
          subject,
          weekday,
          time,
        },
      })
      .then(
        ({ data }) => {
          setClasses(data);
          if (data.length > 0) {
            setFiltersIsVisible(false);
          }
        },
        (error) => {
          console.warn(error);
          setEmptyMessage('Ocorreu um erro ao buscar, tente novamente.');
        }
      )
      .then(() => {
        setEmptyMessage('Nenhum proffy encontrado\npara sua pesquisa.');
      });
  }

  return (
    <View style={styles.container}>
      <PageHeader
        title="Proffys Disponíveis"
        callToAction={
          <RectButton
            style={styles.buttonToggleFilters}
            onPress={toggleFiltersIsVisible}
          >
            <Feather name="filter" size={20} color="#FFF" />
          </RectButton>
        }
      >
        {filtersIsVisible && (
          <View style={styles.filtersContainer}>
            <View style={styles.inputGroupItem}>
              <Text style={styles.label}>Matéria</Text>
              <TextInput
                style={styles.input}
                placeholder="Qual a mátéria?"
                placeholderTextColor="#C1BCCC"
                value={subject}
                onChangeText={(value) => setSubject(value)}
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.inputGroupItem}>
                <Text style={styles.label}>Dia da semana</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Qual o dia?"
                  placeholderTextColor="#C1BCCC"
                  value={weekday}
                  onChangeText={(value) => setWeekday(value)}
                />
              </View>
              <Text>{'    '}</Text>
              <View style={styles.inputGroupItem}>
                <Text style={styles.label}>Horário</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Qual horário?"
                  placeholderTextColor="#C1BCCC"
                  value={time}
                  onChangeText={(value) => setTime(value)}
                />
              </View>
            </View>
            <RectButton
              style={styles.buttonSubmitFilter}
              onPress={searchClasses}
            >
              <Text style={styles.buttonSubmitFilterText}>Filtrar</Text>
            </RectButton>
          </View>
        )}
      </PageHeader>
      <ScrollView style={styles.teacherList}>
        {classes.map((classItem, index) => {
          return (
            <TeacherItem
              key={index}
              classInfo={classItem}
              favorite={favorites.includes(classItem.user_id)}
            />
          );
        })}
        {classes.length === 0 && (
          <View style={styles.emptyResult}>
            <Text style={styles.emptyResultText}>{emptyMessage}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
